Template.stageSettings.events({
    'blur #stage-title': function (event, template) {
        Meteor.call('stageTitle', template.data._id, $('#stage-title').val());
    },
    
    'click #add-layer, keypress #add-layer-title': function (event, template) {
        if (event.type == 'keypress' && event.which != 13) return;
        var layers = template.data.settings.layers;
        layers.push($('#add-layer-title').val());
        Meteor.call('stageSetting', template.data._id, 'layers', layers);
        $('#add-layer-title').val('');
    },
    
    'click .layer-down': function (event, template) {
        var layers = template.data.settings.layers;
        var i = layers.indexOf(this.toString());
        if (i < layers.length-1) {
            layers.splice(i+1, 0, layers.splice(i, 1)[0]);
            Meteor.call('stageSetting', template.data._id, 'layers', layers);
        }
    },

    'click .layer-up': function (event, template) {
        var layers = template.data.settings.layers;
        var i = layers.indexOf(this.toString());
        if (i > 0) {
            layers.splice(i-1, 0, layers.splice(i, 1)[0]);
            Meteor.call('stageSetting', template.data._id, 'layers', layers);
        }
    },
    
    'click .layer-del': function (event, template) {
        var layers = template.data.settings.layers;
        var i = layers.indexOf(this.toString());
        layers.splice(i, 1);
        Meteor.call('stageSetting', template.data._id, 'layers', layers);
    },
    
    'click .stage-settings-delete': function (event, template) {
        template.$('#delete-modal').modal('show');
    },
    
    'click .stage-delete-cancel': function (event, template) {
        template.$('#delete-modal').modal('hide');
    },
    
    'click .stage-delete-confirm': function (event, template) {
        template.$('#delete-modal').removeClass('fade').modal('hide');
        Meteor.call('stageDelete', this._id);
        Router.go('/minions/');
    }
});
