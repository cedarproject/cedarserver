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
            active: null,
            contents: []
        });
    },
    
    setDelete: function (setid) {
        var set = checkSet(setid);
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
    
    setAdd: function (setid, action) {
        var set = checkSet(setid);
        sets.update(set, {$push: {actions: action}});
    },
    
    setRemove: function (setid, actionindex) {
        var set = checkSet(setid);
        sets.update(set, {$pull: {$position: actionindex}});
    },
    
    setActivate: function (setid, actionindex) {
        // TODO: Redo all this code, put most of it in the Stage or Minion functions instead, make utility functions to reduce repeated code
        var set = checkSet(setid);
        var action = set.actions[actionindex];
        
        sets.update(set, {$set: {active: actionindex}});
        
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
            var action = set.actions[set.active];
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
