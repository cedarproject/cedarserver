Template.setAction.events({
    'click .settings-button': function (event, template) {
        template.$('.settings').first().collapse('toggle');
    }
});
