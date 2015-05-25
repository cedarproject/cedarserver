Template.actionSelector.helpers({
    mediaSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: ['title']
    },
    sceneSelector: {
        collection: lightscenes,
        displayTemplate: 'lightScene',
        fields: ['title']
    },
});

Template.actionSelector.events({    
    'click .action-selector-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    }
});
