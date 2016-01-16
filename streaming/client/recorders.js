Template.streamingRecorders.helpers({
    recordTypeIs: function (type) {
        return Session.get('recordtype') == type;
    },
    
    getSources: function () {
        return streamingsources.find({}, {sort: [['title', 'asc']]});
    },
    
    getMixes: function () {
        return streamingmixes.find({}, {sort: [['title', 'asc']]});
    },
    
    recorders: function () {
        return streamingrecorders.find();
    },
    
    getRecorderTitle: function () {
        if (this.source) return streamingsources.findOne(this.source).title;
        else if (this.mix) return streamingmixes.findOne(this.mix).title;
    }
});
    
Template.streamingRecorders.onCreated(function () {
    Session.set('recordtype', 'source');
});

Template.streamingRecorders.events({
    'change #recordtype': function (event, template) {
        Session.set('recordtype', $(event.target).val());
    },
    
    'click #record': function (event, template) {
        var type = Session.get('recordtype');
        
        if (type == 'source') var _id = template.$('#source').val();
        else if (type == 'mix') var _id = template.$('#mix').val();
        
        var uri = template.$('#uri').val();
        
        Meteor.call('streamingRecorderStart', type, _id, uri);
    },
    
    'click .recorder-stop': function (event, template) {
        Meteor.call('streamingRecorderStop', this._id);
    }
});
