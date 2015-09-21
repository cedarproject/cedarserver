Router.route('/songs', {name: 'songs'});

Router.route('/songs/song/:_id', {
    name: 'songSettings',
    waitOn: function () {
        return [Meteor.subscribe('songs'), Meteor.subscribe('songsections'),
                Meteor.subscribe('songarrangements')];
    },
    data: function () {return songs.findOne({_id: this.params._id});}
});

Router.route('/songs/download/:_id', function () {
    var file = {
        song: songs.findOne(this.params._id),
        sections: songsections.find({song: this.params._id}).fetch(),
        arrangements: songarrangements.find({song: this.params._id}).fetch(),
    };

    var headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="' + file.song.title + '.cedarsong"',
        'Cache-Control': 'max-age=0', // Don't cache Songs.
    };
    
    this.response.writeHead(200, headers);
    this.response.end(EJSON.stringify(file));
}, {
    name: 'songdownload',
    where: 'server'
});
