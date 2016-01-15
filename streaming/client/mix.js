Template.streamingMix.helpers({
    sourceSelector: {
        collection: streamingsources,
        displayTemplate: 'streamingSourceDisplay',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: true
    },
    
    getSource: function () {
        return streamingsources.findOne(this.toString());
    }
});

Template.streamingMix.onRendered(function () {
    receiveStream('mix', this.data._id, this.$('#mix-video')[0]);
});

Template.streamingMix.events({
    'click #add-source': function (event, template) {
        template.$('#mix-source-modal').modal('show');
    },
    
    'click .collection-add': function (event, template) {
        Meteor.call('streamingMixAddSource', template.data._id, $(event.target).data('id'));
    },
    
    'click .modal-close': function (event, template) {
        template.$('#mix-source-modal').modal('hide');
    }
});
