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
        sets.remove(set);
        actions.remove({set: setid});
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
    
    actionMove: function (actionid, index) {
        // This took way too long for me to figure out... - isaac
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
        // TODO: Redo all this code, put most of it in the Stage or Minion functions instead, make utility functions to reduce repeated code
        var set = checkSet(setid);
        var action = actions.findOne(actionid);
        
        sets.update(set, {$set: {active: actionid}});
        
        if (action.type == 'media') {
            if (action.minions.length > 0) {
                var targets = action.minions;
            } else {
                var targets = minions.find({stage: set.stage, roles: {$all: [action.role]}}).fetch();
                targets.forEach(function (target, index, targets) {
                    targets[index] = target._id;
                });
            } 
                       
            var actMedia = media.findOne(action.media);
            
            if (actMedia.type == 'video' || actMedia.type == 'image') {
                // If media is a video or an image, stop any other playing videos/images
                targets.forEach(function (minionid) {
                    minions.update(minionid, {$pull: {actions: {mediatype: {$in: ['video', 'image']}}}});
                });
            }
            else if (actMedia.type == 'audio') {
                // If media is audio, stop any other playing audio
                targets.forEach(function (minionid) {
                    minions.update(minionid, {$pull: {actions: {mediatype: 'audio'}}});
                });
            }

            targets.forEach(function (minionid) {
                Meteor.call('minionAddAction', minionid, action);
            });
        }
    },
    
    setDeactivate: function (setid) {
        var set = checkSet(setid);
        if (set.active !== null) {
            var action = actions.findOne(set.active);
            sets.update(set, {$set: {active: null}});

            if (action.type == 'media') {
                if (action.minions.length > 0) {
                    var targets = action.minions;
                } else {
                    var targets = minions.find({stage: set.stage, roles: {$all: [action.role]}}).fetch();
                }
                
                targets.forEach(function (minion) {
                    minions.update(minion._id, {$set: {actions: []}});
                });
            }
        }
    }
});
