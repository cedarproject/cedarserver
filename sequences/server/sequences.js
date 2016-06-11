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
        if (sequence_handlers[action.settings.sequence_channel])
            sequence_handlers[action.settings.sequence_channel].stop();
        
        sequence_handlers[action.settings.sequence_channel] = new SequenceHandler(action);
    },
    
    sequenceDeactivateChannel: function (channel) {
        if (sequence_handlers[channel]) {
            sequence_handlers[channel].stop();
            delete sequence_handlers[channel];
        }
    }
});
