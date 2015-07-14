Template.actionSelector.helpers({
    mediaSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 1]]
    },
    sceneSelector: {
        collection: lightscenes,
        displayTemplate: 'lightScene',
        fields: [{field: 'title', type: String}],
        sort: [['title', 1]]
    },
});

Template.actionSelector.events({    
    'click .action-selector-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    }
});
