Template.streamingSources.helpers({
    sources: function () {
        return streamingsources.find({}, {sort: [['title', 'asc']]});
    }
});

Template.streamingSources.events({
    'click #add-webrtc': function (event, template) {
        var source = Meteor.call('streamingSourceAdd', 'webrtc');
        Router.go('/streaming/source/' + source);
    },
    
    'click #add-rtsp': function (event, template) {
        var source = Meteor.call('streamingSourceAdd', 'rtsp');
        Router.go('/streaming/source/' + source);
    }
});
