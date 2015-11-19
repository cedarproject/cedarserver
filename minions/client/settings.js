Template.minionsettings.helpers({
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },
    
    titleOf: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) {return stage.title;}
        else {return 'Unassigned';}
    },
    
    getSetting: function (setting) {
        return combineSettings(this.settings)[setting];
    },
    
    isSelected: function (setting, value) {
        if (combineSettings(this.settings)[setting] == value) return 'selected';
    },
    
    typeIs: function (type) {
        return type == this.type;
    },
    
    getLayers: function () {
        var stage = stages.findOne({_id: this.stage});
        return stage.settings.layers;
    },
    
    isLayerChecked: function () {
        if (Template.parentData().layers.hasOwnProperty(this)) return 'true';
    }
});

Template.minionsettings.events({
    'blur .minion-name': function (event, template) {
        Meteor.call('minionName', this._id, $(event.target).val());
    },
    
    'change .minion-stage': function (event, template) {
        Meteor.call('minionStage', this._id, $(event.target).val());
    },

    'click .display-layer-checkbox': function (event, template) {
        if (event.target.checked) {
            if (!template.data.layers.hasOwnProperty(this.toString())) 
                Meteor.call('minionAddLayer', template.data._id, this.toString());
        }
        
        else {
            if (template.data.layers.hasOwnProperty(this.toString()))
                Meteor.call('minionDelLayer', template.data._id, this.toString());
        }
    },
    
    'change .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        var value = $(event.target).val();
        Meteor.call('minionSetting', template.data._id, setting, value);
    },
    
    'click .minion-settings-delete': function (event) {
        $('.delete-modal').modal('show');
    },
    
    'click .minion-delete-cancel': function (event) {
        $('.delete-modal').modal('hide');
    },
    
    'click .minion-delete-confirm': function (event) {
        $('.delete-modal').removeClass('fade').modal('hide');
        Meteor.call('minionDelete', this._id);
        Router.go('/minions');
    },
});
