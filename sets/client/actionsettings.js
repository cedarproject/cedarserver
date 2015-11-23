Template.actionSettings.helpers({
    getSetting: function () {
        var s = combineSettings(this.settings);
        for (var i = 0; i < arguments.length - 1; i++) s = s[arguments[i]];
        return s;
    },
    
    isSelected: function (setting, value) {
        if (combineSettings(this.settings)[setting] == value) return 'selected';
    },
    
    typeIs: function () {
        for (var i in arguments) {
            if (arguments[i] == this.type) return true;
        }
    },
    
    triggers: function () {
        return actions.find({actionid: this._id});
    },
    
    getLayers: function () {
        var stageid = Template.parentData().stage;
        if (!stageid) stageid = Template.parentData(2).stage;
        var stage = stages.findOne({_id: stageid});
        return stage.settings.layers;
    },

    isLayerSelected: function () {
        if (Template.parentData().layer == this.toString()) return 'selected';
    },
    
    getSongArrangements: function () {
        return songarrangements.find({song: this.song});
    },
    
    isActiveArrangement: function () {
        if (Template.parentData().settings.arragement == this._id) return 'selected';
    },

    getSongKeys: function () {
        var keys = [];
        for (var p in key2num) if (key2num.hasOwnProperty(p)) keys.push(p);
        return keys;
    },
    
    isSongKeySelected: function (key) {
        if (Template.parentData().settings.key == key) return 'selected';
    },
    
    getLightSceneFade: function () {
        if (typeof this.settings['lights_fade'] === 'undefined')
            return lightscenes.findOne(this.lightscene).settings.fade;
        else return this.settings.lights_fade;
    }
});

Template.actionSettings.events({
    'blur .action-title': function (event, template) {
        Meteor.call('actionTitle', template.data._id, $(event.target).val());
    },
    
    'change .action-layer': function (event, template) {
        event.stopImmediatePropagation();
        Meteor.call('actionLayer', template.data._id, $(event.target).val());
    },

    'change .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        var value = $(event.target).val();
        Meteor.call('actionSetting', template.data._id, setting, value);
    },
    
    'change .song-arrangement': function (event, template) {
        Meteor.call('actionSetting', template.data._id, 'arrangement', $(event.target).val());
    },
    
    'change .song-key': function (event, template) {
        Meteor.call('actionSetting', template.data._id, 'key', $(event.target).val());
    },
    
    'click .trigger-del': function (event, template) {
        Meteor.call('actionRemove', this._id);
    },

    'click .trigger-add': function (event, template) {
        Session.set('add-to', {type: 'action', action: this._id });
        $('.action-selector-modal').modal('show');
    },
        
    'click .action-del': function (event, template) {
        Meteor.call('actionRemove', template.data._id);
    },
    
    'click .well': function(event, template) {
        event.stopImmediatePropagation();
        return false;
    }
});
