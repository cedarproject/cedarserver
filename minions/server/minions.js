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
        
        minionid = minions.insert({
            name: 'New ' + type + ' minion',
            stage: null,
            type: type,
            roles: ['background'],
            settings: {},
            actions: [],
            connected: false
        });
        
        console.log(minionid);
        return minionid;
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
    
    minionName: function (minionid, name) {
        var minion = checkMinion(minionid);
        minions.update(minion, {$set: {name: name}});
    },
    
    minionStage: function (minionid, stageid) {
        var minion = checkMinion(minionid)
        minions.update(minion, {$set: {stage: stageid}});
    },
    
    minionRoles: function (minionid, groups) {
        var minion = checkMinion(minionid);
        minions.update(minion, {$set: {groups: groups}});
    },
    
    minionSetting: function (minionid, key, value) {
        var minion = checkMinion(minionid);
        var set = {};
        set[key] = value;
        minions.update(minion, {$set: set});
    },
    
    minionAddAction: function (minionid, action) {
        var minion = checkMinion(minionid);
        minions.update(minion, {$push: {actions: action}});
    },
    minionDelAction: function (minionid, actionindex) {
        var minion = checkMinion(minionid);
        minions.update(minion, {$pull: {$position: actionindex}});
    }
});
