Template.mediaItems.helpers({
    mediaFormData: {
        type: 'uploadmedia'
    },
    
    mediaSelector: {
        collection: media,
        displayTemplate: 'media',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['new', 'desc'], ['title', 'asc']],
        addbutton: false
    }
});
