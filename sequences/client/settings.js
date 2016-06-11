Template.sequenceSettings.helpers({
    stageTitle: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) return stage.title;
        else return 'Unassigned';
    },
    
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },
    
    getSetting: function (setting) {
        return this.settings[setting];
    },
    
    getBeat: function () {
        return 60.0 / this.settings.bpm;
    },
    
    isSelected: function (setting, value) {
        if (this.settings[setting] == value) return 'selected';
    },

    actions: function () {
        return actions.find({sequenceid: this._id}, {sort: [['settings.sequence_start', 'asc']]});
    },
    
    selectedAction: function () {
        return actions.findOne(Session.get('sequence-active'));
    }
});

Template.sequenceSettings.onCreated(function () {
    Session.set('taps', []);
    Session.set('sequence-active', null);
});

Template.sequenceSettings.events({
    'click #sequence-play': function (event, template) {
        Meteor.call('sequenceActionActivate', {
            sequence: template.data._id,
            time: time.now() * 0.001 + 0.2,
            settings: {
                sequence_channel: 'preview-' + template.data._id,
            }
        });
    },
    
    'click #sequence-stop': function (event, template) {
        Meteor.call('sequenceDeactivateChannel', 'preview-' + template.data._id);
    },
    
    'click #settings-toggle': function (event, template) {
        template.$('#settings').collapse('toggle');
    },
    
    'blur #title': function (event, template) {
        var title = $(event.target).val();
        
        if (title.trim().length > 0)
            Meteor.call('sequenceTitle', template.data._id, title);
    },
    
    'change #stage': function (event, template) {
        var stage = $(event.target).val();
        if (stage) Meteor.call('sequenceStage', template.data._id, stage);
    },
    
    'click #bpm-tap': function (event, template) {
        // TODO this should take the average of the time between each tap, too lazy to fix now.
        var taps = Session.get('taps');
        var now = performance.now();
        
        if (taps.length > 0 && taps[taps.length-1] < now - 2000)
            taps = [];
        
        if (taps.length == 0) taps.push(now);
        
        if (taps.length >= 2) {
            var bpm = (taps.reduce((p,v) => p+v) / taps.length) * 0.001;
            Meteor.call('sequenceSetting', template.data._id, 'bpm', bpm);
        }
        
        if (taps.length > 7) taps.shift();
        Session.set('taps', taps);
    },
    
    'change .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        var value = $(event.target).val();
        
        Meteor.call('sequenceSetting', template.data._id, setting, value);
    },
    
    'click #add-action': function (event, template) {
        template.$('.action-selector-modal').modal('show');
    },
    
    'click .collection-add': function (event, template) {
        var col = $(event.target).data('collection');
        var _id = $(event.target).data('id');
        
        var action = create_action(col, _id);

        action.sequenceid = template.data._id;
        action.settings.sequence_start = 0.0;
        
        Meteor.call('actionAdd', action);
    },
    
    'blur .action-start': function (event, template) {
        var val = parseFloat($(event.target).val());
        
        if (!isNaN(val) && val > 0) {
            if (val > template.data.settings.duration) val = template.data.setting.duration;
            Meteor.call('actionSetting', this._id, 'sequence_start', val)
        }
    },
    
    'click .action-item': function (event, template) {
        Session.set('sequence-active', this._id);
    },
    
    'click .action-del': function (event, template) {
        Meteor.call('actionRemove', this._id);
    }
});
