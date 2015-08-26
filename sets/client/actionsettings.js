Template.actionSettings.helpers({
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
    }
});

Template.actionSettings.events({
    'change .action-layer': function (event, template) {
        Meteor.call('actionLayer', template.data._id, $(event.target).val());
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
