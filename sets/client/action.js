Template.setAction.helpers({
    triggersActive: function () {
        if (this.settings.triggers) return 'active';
    }
});

Template.setAction.events({
    'click .settings-button': function (event, template) {
        template.$('.settings').first().collapse('toggle');
    },
    
    'click .action-triggers': function (event, template) {
        Meteor.call('actionSetting', template.data._id, 'triggers', !template.data.settings.triggers);
    }
});
