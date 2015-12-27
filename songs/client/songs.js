Template.songs.helpers({
    songFormData: {
        type: 'importsong'
    },
    
    songsSelector: {
        collection: songs,
        displayTemplate: 'song',
        fields: [{field: 'title', type: String}],
        sort: [['title', 1]],
        addbutton: false
    }
});

Template.songs.events({
    'click #song-new': function () {
        Meteor.call('songNew', (err, _id) => {
            if (!err) Router.go('/songs/song/' + _id);
        });
    }
});
