Template.setAction.helpers({
    triggersActive: function () {
        if (this.settings.triggers) return 'btn-default active';
        else return 'btn-danger';
    }
});

Template.setAction.events({
    'click .settings-button': function (event, template) {
        event.stopImmediatePropagation();
        template.$('.settings').first().collapse('toggle');
    },
    
    'click .action-triggers': function (event, template) {
        Meteor.call('actionSetting', template.data._id, 'triggers', !template.data.settings.triggers);
    }
});
