Template.lightConsoles.helpers({
    consoles: function () {
        return lightconsoles.find();
    }
});

Template.lightConsoles.events({
    'click #new-console': function () {
        Meteor.call('lightConsoleNew');
    }
});
