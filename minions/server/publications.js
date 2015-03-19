Meteor.publish('stages', function () {
    return stages.find();
});

Meteor.publish('minions', function (minionid) {
    if (minionid) {
        return minions.find({_id: minionid});
    }
    else {
        return minions.find();
    }
});
