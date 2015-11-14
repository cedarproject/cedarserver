Template.streamingMenu.helpers({
    connected: function () {
        return Meteor.call('streamingConnected');
    },
    
    server: function () {
        return settings.findOne({key: 'streamingserver'}).value;
    }
});

Template.streamingMenu.events({
    'blur #server': function (event, template) {
        Meteor.call('mainSetting', 'streamingserver', $(event.target).val());
    },
    
    'click #connect': function (event, template) {
        Meteor.call('streamingConnect');
    }
});
