Template.lightSceneSettings.helpers({
    lightSelector: {
        collection: lights,
        displayTemplate: 'light',
        fields: ['title']
    },
    
    groupSelector: {
        collection: lightgroups,
        displayTemplate: 'lightGroup',
        fields: ['title']
    },
    
    getLight: function () {
        return lights.findOne(this.light);
    },
    
    getGroup: function () {
        return lightgroups.findOne(this.group);
    },
    
    getLightChannels: function () {
        this.channels = lights.findOne(this.light).channels;
        return this;
    },
    
    getGroupChannels: function () {
        this.channels = lightgroups.findOne(this.group).channels;
        return this;
    },
});

Template.lightSceneSettings.events({
    'blur #scene-title': function (event) {
        var title = $(event.target).val();
        Meteor.call('sceneTitle', this._id, title);
    },
    
    'click #add-light': function (event) {
        $('#add-light-modal').modal('show');
    },
    
    'click #add-group': function (event) {
        $('#add-group-modal').modal('show');
    },
    
    'click .modal-close': function(event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .collection-add': function (event, template) {
        if ($(event.target).data('collection') == 'lights') {
            Meteor.call('sceneAddLight', template.data._id, $(event.target).data('id'));
        }
        
        else if ($(event.target).data('collection') == 'lightgroups') {
            Meteor.call('sceneAddGroup', template.data._id, $(event.target).data('id'));
        }
    },
    
    'click .light-del': function (event, template) {
        var index = template.data.lights.indexOf(this);
        Meteor.call('sceneDelLight', template.data._id, index);
    },
    
    'click #del-scene': function (event, template) {
        Meteor.call('sceneDel', template.data._id);
        Router.go('/lighting/scenes');
    },
    
    'slideStop #valueselector': function (event, template) {
        var channel = $(event.target).data('channel');
        
        var values = this.values;
        values[channel] = parseFloat($(event.target).val());
        
        var index = template.data.lights.indexOf(this);
        Meteor.call('sceneSetValue', template.data._id, index, values);
    }
});
