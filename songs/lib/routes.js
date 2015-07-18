Router.route('/songs', {name: 'songs'});

Router.route('/songs/song/:_id', {
    name: 'songSettings',
    data: function () {return songs.findOne({_id: this.params._id});}
});
