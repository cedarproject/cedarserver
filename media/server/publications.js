Meteor.publish('media', function () {
    return media.find();
});
