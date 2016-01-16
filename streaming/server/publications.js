Meteor.publish('streamingsources', function () {
    return streamingsources.find();
});

Meteor.publish('streamingviewers', function () {
    return streamingviewers.find();
});

Meteor.publish('streamingmixes', function () {
    return streamingmixes.find();
});

Meteor.publish('streamingrecorders', function () {
    return streamingrecorders.find();
});
