Template.lightConsoles.helpers({
    consoles: function () {
        return lightconsoles.find();
    },
    
    consoleSelector: {
        collection: lightconsoles,
        displayTemplate: 'lightconsolesListItem',
        fields: [{field: 'title', type: String}],
        sort: [['title', 1]],
        addbutton: false
    },
});

Template.lightConsoles.events({
    'click #new-console': function () {
        Meteor.call('lightConsoleNew');
    }
});
