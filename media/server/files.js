process_media = function (fileInfo, formFields) {
    var mediaid = media.insert({
        title: fileInfo.name,
        location: fileInfo.name,
        type: null,
        duration: null,
        thumbnail: null,
        layer: 'background',
        tags: [],
        new: true
    });
    
    var m = media.findOne(mediaid);
    var prefix = settings.findOne({key: 'mediadir'}).value;

    var mimetype = MIME.lookup(m.location)
    var type = mimetype.split('/')[0];
    
    if (type == 'image') {
        if (mimetype == 'image/svg+xml') {
            media.update(m, {$set: {type: 'image', thumbnail: m.location}});
        }
        
        else {            
            gm(prefix + '/' + m.location)
                .resize(64, 64)
                .write(prefix + '/thumbs/' + m.location, Meteor.bindEnvironment(function (err) {
                    if (err) console.log(err);
                    media.update(m, {$set: {type: 'image', thumbnail: 'thumbs/' + m.location}});
            }.bind(this)));
        }
    }
    
    else if (type == 'audio') {        
        ffmpeg.ffprobe(prefix + m.location, Meteor.bindEnvironment(function (err, metadata) {
            if (err) {console.log(err); return;}
        
            if (metadata.format['tags'] !== undefined) {
                if (metadata.format.tags['title'] !== undefined) {
                    media.update(m, {$set: {title: metadata.format.tags.title}});
                }
            }
            
            media.update(m._id, {$set: {type: 'audio', layer: 'audio', duration: metadata.format.duration}});
            
            ffmpeg(metadata.format.filename).noAudio().videoCodec('png').size('64x64')
            .on('end', Meteor.bindEnvironment(function () {
                media.update(m._id, {$set: {thumbnail: '/thumbs/' + m.location + '.png'}});
            }).bind(this)).on('error', function (err) {
                console.log(err);
            }).save(prefix + '/thumbs/' + m.location + '.png');
        }.bind(this)));
    }
    
    else if (type == 'video') {
        ffmpeg.ffprobe(prefix + m.location, Meteor.bindEnvironment(function (err, metadata) {
            if (err) {console.log(err); return;}
        
            if (metadata.format['tags'] !== undefined) {
                if (metadata.format.tags['title'] !== undefined) {
                    media.update(m, {$set: {title: metadata.format.tags.title}});
                }
            }
            
            media.update(m._id, {$set: {type: 'video', duration: metadata.format.duration}});
            
            ffmpeg(metadata.format.filename).on('end', Meteor.bindEnvironment(function () {
                media.update(m._id, {$set: {thumbnail: 'thumbs/' + m.location + '.png'}});
            }.bind(this))).on('error', function (err) {
                console.log(err);
            }).screenshots({
                count: 1,
                timestamps: [1],
                folder: prefix + '/thumbs/',
                filename: m.location + '.png',
                size: '64x64'
            });
            
            if (metadata.format['format_name'] == 'mov,mp4,m4a,3gp,3g2,mj2') {
                /* This is an mp4 or mov container, which sometimes needs to be
                   rewritten to allow the video to start playing before it's fully downloaded.
                   See http://multimedia.cx/eggs/improving-qt-faststart/ for more info */
                
                ffmpeg(metadata.format.filename).videoCodec('copy').audioCodec('copy').outputOptions(
                    ['-movflags', 'faststart']
                ).output(prefix + '/tmp/' + m.location).on('end', function () {
                    var fs = Npm.require('fs');
                    fs.rename(prefix + '/tmp/' + m.location, prefix + '/' + m.location, function () {});
                }.bind(this)).on('error', function () {
                    var fs = Npm.require('fs');
                    fs.unlink(prefix + '/tmp/' + m.location, function () {});
                }.bind(this)).run();
            }
        }.bind(this)));
    }
}
