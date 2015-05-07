Template.lightGroups.helpers({
    lightgroups: function () {
        return lightgroups.find();
    }
});

Template.lightGroups.events({
    'click .group-add': function (event) {
        Meteor.call('lightGroupNew');
    }
});
