Template.mediaMenu.helpers({
    mediaFormData: {
        type: 'uploadmedia'
    },
    
    mediaSelector: {
        collection: media,
        displayTemplate: 'media',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['new', -1], ['title', 1]],
        addbutton: false
    }
});
