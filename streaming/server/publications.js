Meteor.publish('streamingsources', function () {
    return streamingsources.find();
});

Meteor.publish('streamingmixes', function () {
    return streamingmixes.find();
});
