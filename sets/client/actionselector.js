Template.actionSelector.helpers({        
    mediaSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 1]],
        addbutton: true
    },
    
    playlistSelector: {
        collection: mediaplaylists,
        displayTemplate: 'mediaPlaylist',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 'asc']],
        addbutton: true
    },
    
    sceneSelector: {
        collection: lightscenes,
        displayTemplate: 'lightScene',
        fields: [{field: 'title', type: String}],
        sort: [['title', 1]],
        addbutton: true
    },

    songSelector: {
        collection: songs,
        displayTemplate: 'song',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 1]],
        addbutton: true
    },

    presentationSelector: {
        collection: presentations,
        displayTemplate: 'presentation',
        fields: [{field: 'title', type: String}],
        sort: [['title', 1]],
        addbutton: true
    },
    
    sourceSelector: {
        collection: streamingsources,
        displayTemplate: 'streamingSourceDisplay',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: true
    }
});

Template.actionSelector.events({    
    'click .action-selector-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    }
});
