Router.route('/songs', {name: 'songs'});

Router.route('/songs/song/:_id', {
    name: 'songSettings',
    waitOn: function () {
        return [Meteor.subscribe('songs'), Meteor.subscribe('songsections'),
                Meteor.subscribe('songarrangements')];
    },
    data: function () {return songs.findOne({_id: this.params._id});}
});
