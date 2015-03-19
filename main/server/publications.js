Meteor.publish('settings', function () {
    return settings.find();
});
