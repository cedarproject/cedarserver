function checkSet(setid) {
    var set = sets.findOne({_id: setid});
    if (!set) {
        throw new Meteor.Error('set-not-found', "Can't find a set with id: " + setid);
    }

    return set;
}

Meteor.methods({
    setNew: function () {
        return sets.insert({
            title: 'New Set',
            settings: {
                times: [],
            },
            stage: null,
            active: null
        });
    },
    
    setCopy: function (setid) {
        var set = checkSet(setid);
        
        delete set._id;
        set.title = `Copy of ${set.title}`;
        
        var newid = sets.insert(set);
        
        actions.find({set: setid}).forEach((action) => {
            var old_actid = action._id;
            delete action._id;

            action.set = newid;
            var new_actid = actions.insert(action);
            
            actions.find({actionid: old_actid}).forEach((trigger) => {
                delete trigger._id;
                trigger.actionid = new_actid;
                actions.insert(trigger);
            });
        });
        
        return newid;
    },
    
    setDelete: function (setid) {
        var set = checkSet(setid);
        
        var actionids = actions.find({set: setid}, {_id: 1}).fetch();
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
    
    setSetting: function (setid, key, value) {
        var set = checkSet(setid);
        var s = {}; s['settings.' + key] = value;
        sets.update(set, {$set: s});
    },
    
    actionAdd: function (action) {
        actions.insert(action);
    },
    
    actionRemove: function (actionid) {
        var action = actions.findOne(actionid);
        actions.remove(actionid);
        if (action.order !== null) actions.update({set: action.set, order: {$gte: action.order}}, {$inc: {order: -1}}, {multi: true});
    },
    
    actionReplace: function (oldid, action) {
        var old = actions.findOne(oldid);
        
        for (var setting in old.settings) {
            if (old.settings.hasOwnProperty(setting)) {
                if (action.settings[setting] === undefined) {
                    action.settings[setting] = old.settings[setting];
                }
            }
        }
        
        for (var prop in old) {
            if (old.hasOwnProperty(prop)) {
                if (action[prop] === undefined) {
                    action[prop] = old[prop];
                }
            }
        }
        
        if (old['layer']) action.layer = old.layer;
        
        actions.update(oldid, action);
    },
    
    actionTitle: function (actionid, title) {
        actions.update(actionid, {$set: {title: title}});
    },
    
    actionLayer: function (actionid, layer) {
        actions.update(actionid, {$set: {layer: layer}});
    },
    
    actionSetting: function (actionid, key, value) {
        var s = {}; s['settings.'+key] = value;
        actions.update(actionid, {$set: s});
    },
    
    actionArgs: function (actionid, args) {
        actions.update(actionid, {$set: {args: args}});
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
    
    setActivate: function (setid, actionid) {
        var set = checkSet(setid);
        var action = actions.findOne(actionid);
        
        if (action.settings.triggers) {
            var triggers = actions.find({actionid: action._id}).fetch();
            var set_actions = [action].concat(triggers);
        }
        
        else var set_actions = [action];
        
        sets.update(set, {$set: {active: actionid}});
        
        var time = (Date.now() + 100) * 0.001;

        for (var i in set_actions) {
            var action = set_actions[i];
            action.set = setid;
            action.time = time;
            
            if (action.type == 'sequence') console.log('calling', action.time);
            action_activate(action);
        }
    },
    
    setClearLayer: function (setid, layer) {
        var set = checkSet(setid);
        
        Meteor.call('stageLayer', set.stage, layer, null);
    },
    
    setDeactivate: function (setid) {
        var set = checkSet(setid);
        if (set.active !== null) {
            var action = actions.findOne(set.active);
            sets.update(set, {$set: {active: null}});
        }
        
        var layers = stages.findOne(set.stage).settings.layers;

        layers.forEach((layer) => {
            Meteor.call('stageLayer', set.stage, layer, null);
        });            
    }
});
