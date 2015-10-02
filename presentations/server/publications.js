Meteor.publish('presentations', function () {
    return presentations.find();
});

Meteor.publish('presentationslides', function () {
    return presentationslides.find();
});
