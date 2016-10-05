function checkMinion (minionid) {
    var minion = minions.findOne(minionid);
    if (!minion) {
        throw new Meteor.Error('minion-not-found', "Can't find a minion with _id " + minionid);
    }
    
    return minion;
}

Meteor.methods({
    minionNew: function (type) {
        if (['media', 'lighting'].indexOf(type) < 0) {
            throw new Meteor.Error('minion-invalid-type', 'Invalid type of minion: ' + type);
        }
        
        var minion = {
            title: 'New ' + type + ' minion',
            stage: null,
            type: type,
            settings: {},
            connected: false
        };
        
        if (type == 'media') {
            minion.layers = ['audio', 'background', 'foreground'];
            minion.settings.blocks = [{
                points: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
                width: 1,
                height: 1,
                x: 0, y: 0,
                brightness: 1,
                blend_top: 0, blend_bottom: 0,
                blend_left: 0, blend_right: 0,
                alpha_mask: false
            }];
        }
        
        return minions.insert(minion);
    },

    minionConnect: function (minionid) {
        var minion = checkMinion(minionid);        
        minions.update(minion, {$set: {connected: true}});
        this.connection.onClose(function () {
            minions.update(minion._id, {$set: {connected: false}});
        });
    },
    
    minionDelete: function (minionid) {
        var minion = checkMinion(minionid);
        minions.remove(minion);
    },
    
    minionTitle: function (minionid, title) {
        var minion = checkMinion(minionid);
        minions.update(minion, {$set: {title: title}});
    },
    
    minionStage: function (minionid, stageid) {
        var minion = checkMinion(minionid);
        var stage = stages.findOne(stageid);
        if (stage) {
            minions.update(minion, {$set: {stage: stageid}});
        };
        // Silently fail on invalid stage id, because of how I coded the <select> on the client
    },
    
    minionAddLayer: function (minionid, layer) {
        var minion = checkMinion(minionid);
        minions.update({_id: minion._id, layers: {$nin: [layer]}}, {$push: {layers: layer}});
    },
    
    minionDelLayer: function (minionid, layer) {
        var minion = checkMinion(minionid);
        minions.update(minion, {$pull: {layers: layer}});
    },
    
    minionSetting: function (minionid, key, value) {
        var minion = checkMinion(minionid);
        var s = {};
        s['settings.' + key] = value;
        minions.update(minion, {$set: s});
    },
});
