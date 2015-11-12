Template.mediaPlaylists.helpers({
    mediaSelector: {
        collection: mediaplaylists,
        displayTemplate: 'mediaPlaylistDisplay',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 'asc']],
        addbutton: false
    }
});

Template.mediaPlaylists.events({
    'click #new-playlist': function (event, template) {
        Meteor.call('playlistNew', (err, playlistid) => {
            Router.go('/media/playlist/' + playlistid);
        });
    }
});
