Template.streamingSource.helpers({
    getSetting: function (setting) {
        return combineSettings(this.settings)[setting];
    },
    
    isSelected: function (setting, value) {
        if (combineSettings(this.settings)[setting] == value) return 'selected';
    }
});

Template.streamingSource.events({
    'blur #title': function (event, template) {
        Meteor.call('streamingSourceTitle', template.data._id, $(event.target).val());
    },
    
    'change .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        var value = $(event.target).val();
        Meteor.call('streamingSourceSetting', template.data._id, setting, value);
    }
});
