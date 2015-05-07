Template.actionSelector.helpers({
    mediaSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: ['title']
    },
    lightSelector: {
        collection: lights,
        displayTemplate: 'light',
        fields: ['title']
    },
    lightGroupSelector: {
        collection: lightgroups,
        displayTemplate: 'lightGroup',
        fields: ['title']
    }
});

Template.actionSelector.events({    
    'click .action-selector-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    }
});
