Meteor.startup(function () {
    sequence_handlers = {};
});

Meteor.methods({
    sequenceNew: function () {
        var _id = sequences.insert({
            title: 'New Sequence',
            stage: null,
            settings: {
                duration: 30.0,
                loop: 'no',
                useBPM: 'no',
                bpm: 60
            }
        });
        
        return _id;
    },
    
    sequenceTitle: function (sequence, title) {
        sequences.update(sequence, {$set: {title: title}});
    },
    
    sequenceStage: function (sequence, stage) {
        sequences.update(sequence, {$set: {stage: stage}});
    },
    
    sequenceSetting: function (sequence, setting, value) {
        var s = {}; s['settings.' + setting] = value;
        sequences.update(sequence, {$set: s});
    },
        
    sequenceActionActivate: function (action) {
        var sequence = sequences.findOne(action.sequence)
        var stage = stages.findOne(sequence.stage);

        var s = {}; s['sequences.' + action.settings.sequence_channel] = sequence._id;
        stages.update(stage, {$set: s});
    },
    
    sequenceDeactivateChannel: function (channel) {
        // TODO this should only reset one stage's channel, not all.
        var s = {}; s['sequences.' + channel] = null;
        stages.update({}, {$unset: s}, {multi: true});
    }
});
