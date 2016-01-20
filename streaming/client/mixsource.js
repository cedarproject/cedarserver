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
        if (this.data.connected) receiveStream(this.data._id, this.$('.mix-source-video')[0]);
    });
});

Template.streamingMixSource.events({
    'click .mix-source-activate-video': function (event, template) {
        var mix = [{
            source: template.data._id,
            sx: 0, sy: 0, sw: 1, sh: 1,
            dx: 0, dy: 0, dw: 1, dh: 1
        }];
        
        Meteor.call('streamingMixChangeVideoMix', Template.parentData(2)._id, mix);
    },

    'click .mix-source-activate-audio': function (event, template) {
        var mix = [{source: template.data._id, volume: 1}];
        Meteor.call('streamingMixChangeAudioMix', Template.parentData(2)._id, mix);
    }
});
