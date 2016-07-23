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
        var mimetype = MIME.lookup(filepath);
        
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

        var status = 200;
        var headers = {
            'Cache-Control': 'max-age=2592000', // 30 days
            'Content-Length': stats.size,
            'Content-Type': mimetype,
            'Accept-Ranges': 'bytes'
        };
        
        // Very hacky HTTP Range implementation!
        
        var start = 0; var end = stats.size;
        var range = this.request.headers['range'];
        
        if (range && range.startsWith('bytes=')) {
            var range = range.slice(6);        
            var dashindex = range.indexOf('-');
            
            if (dashindex <= 0) {
                var start = 0;
                var end = parseInt(range.split('-')[0]);
            } else if (dashindex == range.length - 1) {
                var start = parseInt(range.split('-')[0]);
                var end = stats.size;
            }

            headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
            headers['Content-Length'] = end - start;
            var status = 206;
        }
        
        this.response.writeHead(status, headers);
        var stream = fs.createReadStream(filepath, {start: start, end: end});
        return stream.pipe(this.response);
    }
}, {where: 'server'});
