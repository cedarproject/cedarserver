Meteor.publish('sets', function () {
    return sets.find();
});

Meteor.publish('actions', function () {
    return actions.find();
});
