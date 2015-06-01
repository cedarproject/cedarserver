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
    }
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
    
    'change .colorselector': function (event, template) {
        var color = $(event.target).val();
        var value = {
            red: (parseInt(color.slice(1,3), 16) / 255.0) || 0,
            green: (parseInt(color.slice(3,5), 16) / 255.0) || 0,
            blue: (parseInt(color.slice(5,7), 16) / 255.0) || 0
        };
        
        value.intensity = (value.red + value.green + value.blue) / 3;
                
        var index = template.data.lights.indexOf(this);
        
        Meteor.call('sceneSetValue', template.data._id, index, value);
    }
});
