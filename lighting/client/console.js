Template.lightConsole.helpers({
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },
    
    titleOf: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) {return stage.title;}
        else {return 'Unassigned';}
    },

    getLight: function (lightid) {
        return lights.findOne(lightid);
    },

    getGroup: function (groupid) {
        return lightgroups.findOne(groupid);
    },

    getScene: function (sceneid) {
        return lightscenes.findOne(sceneid);
    },
    
    lightSelector: {
        collection: lights,
        displayTemplate: 'light',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
        sort: [['title', 1]],
        addbutton: true
    },
    
    groupSelector: {
        collection: lightgroups,
        displayTemplate: 'lightGroup',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
        sort: [['title', 1]],
        addbutton: true
    },
    
    sceneSelector: {
        collection: lightscenes,
        displayTemplate: 'lightScene',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
        sort: [['title', 1]],
        addbutton: true
    }
});

Template.lightConsole.events({
    'click #settings-toggle': function (event, template) {
        template.$('#settings-pane').collapse('toggle');
    },
    
    'blur #title': function (event, template) {
        Meteor.call('lightConsoleTitle', this._id, $(event.target).val());
    },
    
    'change #console-stage': function (event, template) {
        Meteor.call('lightConsoleStage', this._id, $('#console-stage').val());
    },

    'blur #console-settings-fade': function (event, template) {
        var fade = parseFloat($(event.target).val());
        if (!isNaN(fade)) Meteor.call('lightConsoleSetting', template.data._id, 'fade', fade);
    },
    
    'click #add-light': function (event) {
        $('#add-light-modal').modal('show');
    },
    
    'click #add-group': function (event) {
        $('#add-group-modal').modal('show');
    },

    'click #add-scene': function (event) {
        $('#add-scene-modal').modal('show');
    },
    
    'click .collection-add': function (event, template) {
        if ($(event.target).data('collection') == 'lights') {
            Meteor.call('lightConsoleAddLight', template.data._id, $(event.target).data('id'));
        }
        
        else if ($(event.target).data('collection') == 'lightgroups') {
            Meteor.call('lightConsoleAddGroup', template.data._id, $(event.target).data('id'));
        }

        else if ($(event.target).data('collection') == 'lightscenes') {
            Meteor.call('lightConsoleAddScene', template.data._id, $(event.target).data('id'));
        }
    },
    
    'click .delete-control': function (event, template) {
        var index = template.data.controls.indexOf(this);
        Meteor.call('lightConsoleRemoveLight', template.data._id, index);
    },
    
    'click #delete-console': function (event, template) {
        Meteor.call('lightConsoleDel', template.data._id);
        Router.go('/lighting/consoles');
    },
    
    'click .modal-close': function (event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'slideStop .valueselector': function (event, template) {
        var channel = $(event.target).data('channel');
        var type = $(event.currentTarget).data('type');
                
        var values = this.values;
        values[channel] = parseFloat($(event.target).val());
        
        if (type == 'light') Meteor.call('lightValues', this._id, values, template.data.settings);
        else if (type == 'group') Meteor.call('lightGroupValues', this._id, values, template.data.settings);
    },
    
    'click .scenebutton': function (event, template) {
        Meteor.call('sceneActivate', this._id);
    }
});
