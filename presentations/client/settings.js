Template.presentationSettings.helpers({
    imageSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}, {field: 'type', type: String, fixed: 'image'}],
        sort: [['title', 'asc']],
        addbutton: true
    },

    slides: function () {
        return presentationslides.find({presentation: this._id}, {sort: {order: 1}});
    },

    isSelected: function (setting, value) {
        if (this.settings[setting] == value) return 'selected';
    },

    getSetting: function (setting) {
        return combineSettings(this.settings)[setting];
    }
});

Template.presentationSettings.events({
    'click #pres-settings-toggle': function (event, template) {
        template.$('#pres-settings-collapse').collapse('toggle');
    },
    
    'blur #pres-title': function (event, template) {
        Meteor.call('presentationTitle', template.data._id, $(event.target).val());
    },
    
    'click #pres-del': function (event, template) {
        Meteor.call('presentationDel', template.data._id);
        Router.go('/presentations');
    },
    
    'click #add-slide': function (event, template) {
        Meteor.call('presentationAddSlide', template.data._id);
    },
    
    'click .collection-add': function (event, template) {
        Meteor.call('presentationSlideImageAdd', Session.get('add-to'), $(event.target).data('id'));
        template.$('.image-modal').modal('hide');
    },
    
    'change .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        var value = $(event.target).val();
        if (value == '') value = null;
        Meteor.call('presentationSetting', template.data._id, setting, value);
    },
    
    'changeColor .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        
        var c = event.color.toRGB();
        if ($(event.target).data('colorpicker').options.format == 'rgba') {
            var value = [c.r / 255.0, c.g / 255.0, c.b / 255.0, c.a];
        } else {
            var value = [c.r / 255.0, c.g / 255.0, c.b / 255.0];
        }

        Meteor.call('presentationSetting', template.data._id, setting, value);
    },
    
    'click .setting-reset': function (event, template) {
        var setting = $(event.target).data('setting');
        Meteor.call('presentationSetting', template.data._id, setting, null);
    }
});
