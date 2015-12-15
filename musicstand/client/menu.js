Template.musicstandmenu.helpers({
    setsSelector: {
        collection: sets,
        displayTemplate: 'musicstandSetDisplay',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: false
    }
});
