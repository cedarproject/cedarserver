Template.setAction.events({
    'click .settings-button': function (event, template) {
        template.$('.settings').collapse('toggle');
    }
});
