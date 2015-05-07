Meteor.publish('lights', function (minionid) {
    if (minionid) return lights.find({minion: minionid});
    else return lights.find();
});

Meteor.publish('lightgroups', function () {
    return lightgroups.find();
});

Meteor.publish('lightscenes', function () {
    return lightscenes.find();
});
