var checkMedia = function (mediaid) {
    var m = media.findOne(mediaid);
    if (m) return m;
    else throw new Meteor.Error('media-not-found', 'Could not find media with the _id: ' + mediaid);
}

Meteor.methods({
    mediaSetNew: function (mediaid, state) {
        var m = checkMedia(mediaid);
        media.update(m, {$set: {new: state}});
    },
    
    mediaTitle: function (mediaid, title) {
        var m = checkMedia(mediaid);
        media.update(m, {$set: {title: title}});
    },
    
    mediaAddTags: function (mediaid, tags) {
        var m = checkMedia(mediaid);
        media.update(m, {$push: {tags: {$each: tags}}});
    },
    
    mediaDelTag: function (mediaid, tag) {
        var m = checkMedia(mediaid);
        media.update(m, {$pull: {tags: tag}});
    },
    
    mediaDel: function (mediaid) {
        var m = checkMedia(mediaid);
        var fs = Npm.require('fs')
        
        fs.unlink(settings.findOne({key: 'mediadir'}).value + '/' + m.location);

        media.remove(m);
    },

    mediaActionActivate: function (action) {
        var set = sets.findOne(action.set);
        
        if (action['minions'] && action.minions.length > 0) {
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
        
        action.time = (Date.now() * 0.001) + 0.1; // Get current time as float, add 100ms

        targets.forEach(function (minionid) {
            Meteor.call('minionAddAction', minionid, action);
        });
    }
});
