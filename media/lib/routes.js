Router.route('/media', {name: 'mediaMenu'});

Router.route('/media/items', {name: 'mediaItems'});
Router.route('/media/item/:_id', {
    name: 'mediaSettings',
    data: function () {return media.findOne(this.params._id);}
});

Router.route('/media/playlists', {name: 'mediaPlaylists'});
Router.route('/media/playlist/:_id', {
    name: 'mediaPlaylistSettings',
    data: function () {return mediaplaylists.findOne(this.params._id);}
});

Router.route('/media/static/:filepath*', function () {
    if (settings.findOne({key: 'mediainternalserver'}).value) {
        var fs = Npm.require('fs');
        var filepath = settings.findOne({key: 'mediadir'}).value + '/' + this.params.filepath;

        try {
            var stats = fs.statSync(filepath);
        }

        catch (e) {
            this.next();
            return;
        }

        if (!stats.isFile()) {
            this.next();
            return;
        }

        var headers = {
            'Cache-Control': 'max-age=2592000', // Cache for 30 days.
            'Content-Length': stats.size
        };
        
        this.response.writeHead(200, headers);
        var stream = fs.createReadStream(filepath);
        return stream.pipe(this.response);
    }
}, {where: 'server'});
