Template.actionSelector.helpers({
    songSelector: {
        collection: songs,
        displayTemplate: 'song',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 1]],
        addbutton: true
    },
        
    mediaSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 1]],
        addbutton: true
    },
    sceneSelector: {
        collection: lightscenes,
        displayTemplate: 'lightScene',
        fields: [{field: 'title', type: String}],
        sort: [['title', 1]],
        addbutton: true
    },
});

Template.actionSelector.events({    
    'click .action-selector-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    }
});
