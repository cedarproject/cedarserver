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
    
    lightSelector: {
        collection: lights,
        displayTemplate: 'light',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
        sort: [['title', 1]],
        addbutton: true
    },

    lightgroupSelector: {
        collection: lightgroups,
        displayTemplate: 'lightGroup',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
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
        addbutton: true,
        altbutton: true
    },
    
    sequenceSelector: {
        collection: sequences,
        displayTemplate: 'sequence',
        fields: [{field: 'title', type: String}],
        sort: [['title', 1]],
        addbutton: true
    }
});

Template.actionSelector.events({    
    'click .action-selector-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    }
});
