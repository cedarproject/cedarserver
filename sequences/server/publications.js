Meteor.publish('sequences', function () {
    return sequences.find();
});
