Meteor.methods({
    mediaActionActivate: function (action) {
        var set = sets.findOne(action.set);
        
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
});
