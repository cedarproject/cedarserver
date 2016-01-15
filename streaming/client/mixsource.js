Template.streamingMixSource.helpers({
    isVideoActive: function () {
        if (Template.parentData(2).videomix.indexOf(this._id) != -1) return 'active';
    },
    
    isAudioActive: function () {
        if (Template.parentData(2).audiomix.indexOf(this._id) != -1) return 'active';
    }
});

Template.streamingMixSource.onRendered(function () {
    this.autorun(() => {
        if (this.data.connected) receiveStream('source', this.data._id, this.$('.mix-source-video')[0]);
    });
});

Template.streamingMixSource.events({
    'click .mix-source-activate-video': function (event, template) {
        Meteor.call('streamingMixChangeVideoMix', Template.parentData(2)._id, [template.data._id]);
    },

    'click .mix-source-activate-audio': function (event, template) {
        Meteor.call('streamingMixChangeAudioMix', Template.parentData(2)._id, [template.data._id]);
    }
});
