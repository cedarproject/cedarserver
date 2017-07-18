Meteor.publish('settings', function () {
    return settings.find();
});

Meteor.publish('customactions', function () {
    return customactions.find();
});
