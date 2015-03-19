Template.setsMenu.helpers({
    sets: function () {
        return sets.find();
    },
});

Template.setsMenu.events({
    'click .sets-new': function () {
        Meteor.call('setNew');
    },
});
