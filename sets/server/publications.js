Meteor.publish('sets', function () {
    return sets.find();
});
