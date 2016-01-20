Template.streamingSource.helpers({
    getSetting: function (setting) {
        return combineSettings(this.settings)[setting];
    },
    
    isSelected: function (setting, value) {
        if (combineSettings(this.settings)[setting] == value) return 'selected';
    },
    
    typeIs: function (type) {
        return type == this.type;
    },

    getSetting: function (setting) {
        return combineSettings(this.settings)[setting];
    },
    
    stages: function () {
        return stages.find({}, {sort: [['title', 'asc']]});
    },
    
    mediaMinions: function (stageid) {
        return minions.find({stage: stageid, type: 'media'}, {sort: [['title', 'asc']]});;
    }
});

Template.streamingSource.onRendered(function () {
    this.autorun(() => {
        if (this.data.connected) receiveStream(this.data._id, this.$('#video')[0]);
    });
});

Template.streamingSource.events({
    'blur #title': function (event, template) {
        Meteor.call('streamingSourceTitle', template.data._id, $(event.target).val());
    },
    
    'change .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        
        if ($(event.target).attr('type') == 'checkbox')
            var value = $(event.target).prop('checked');
        else var value = $(event.target).val();
        
        Meteor.call('streamingSourceSetting', template.data._id, setting, value);
    },
    
    'click #rtsp-connect': function (event, template) {
        Meteor.call('streamingSourceConnect', template.data._id);
    },
    
    'click #delete': function (event, template) {
        Meteor.call('streamingSourceDel', template.data._id);
        Router.go('/streaming/sources');
    }
});
