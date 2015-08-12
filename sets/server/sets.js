function checkSet(setid) {
    var set = sets.findOne({_id: setid});
    if (!set) {
        throw new Meteor.Error('set-not-found', "Can't find a set with id: " + setid);
    }

    return set;
}

Meteor.methods({
    setNew: function () {
        sets.insert({
            title: 'New Set',
            stage: null,
            active: null
        });
    },
    
    setDelete: function (setid) {
        var set = checkSet(setid);
        
        var actionids = actions.find({set: setid}, {_id: 1});
        for (var i in actionids) actionids[i] = actionids[i]._id;
        actions.remove({action: {$in: actionids}});
        
        actions.remove({set: setid});
        sets.remove(set);
    },
    
    setTitle: function (setid, newtitle) {
        var set = checkSet(setid);
        sets.update(set, {$set: {title: newtitle}});
    },
    
    setStage: function (setid, stageid) {
        var set = checkSet(setid);
        sets.update(set, {$set: {stage: stageid}});
    },
    
    actionAdd: function (action) {
        actions.insert(action);
    },
    
    actionRemove: function (actionid) {
        var index = actions.findOne(actionid).order;
        actions.remove(actionid);
        actions.update({order: {$gte: index}}, {$inc: {order: -1}}, {multi: true});
    },
    
    actionSetting: function (actionid, key, value) {
        actions.update(actionid, {$set: {key: value}});
    },
    
    actionMove: function (actionid, index) {
        var action = actions.findOne(actionid);
        var setid = action.set;

        var max = actions.find({set: setid}).count() - 1;
        if (index < 0) index = 0;
        if (index > max) index = max;

        if (action.order > index) actions.update({set: setid, order: {$gte: index, $lt: action.order}}, {$inc: {order: 1}}, {multi: true});
        else if (action.order < index) actions.update({set: setid, order: {$lte: index, $gt: action.order}}, {$inc: {order: -1}}, {multi: true});
        actions.update({_id: actionid}, {$set: {order: index}});
    },
    
    setActivate: function (setid, actionid, args) {
        var set = checkSet(setid);
        var action = actions.findOne(actionid);
        action.args = args;
        var triggers = actions.find({actionid: action._id}).fetch();

        var set_actions = [action].concat(triggers);
        
        sets.update(set, {$set: {active: actionid}});

        for (var i in set_actions) {
            var action = set_actions[i];
            action.set = setid;
            if (action.type == 'media') {
                Meteor.call('mediaActionActivate', action);
            }
            
            else if (action.type == 'lightscene') {
                Meteor.call('sceneActionActivate', action);
            }
            
            else if (action.type == 'song') {
                Meteor.call('songActionActivate', action);
            }
        }
    },
    
    setDeactivate: function (setid) {
        var set = checkSet(setid);
        if (set.active !== null) {
            var action = actions.findOne(set.active);
            sets.update(set, {$set: {active: null}});
        }

        // TODO below should get list of layers from Stage!
        var l = {}
        var layers = ['background', 'foreground', 'audio'];
        for (var i in layers) l['layers.' + layers[i]] = null;
        minions.update({type: 'media', stage: set.stage}, {$set: l}, {multi: true});
    }
});
