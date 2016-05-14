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
});
