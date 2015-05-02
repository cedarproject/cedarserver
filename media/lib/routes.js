Router.route('/media', {name: 'mediaMenu'});

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
