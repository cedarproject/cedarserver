function process_media(fileInfo, formFields) {
    var mediaid = media.insert({
        title: fileInfo.name,
        location: fileInfo.name,
        type: null,
        duration: null,
        thumbnail: null,
        tags: [],
        new: true
    });
    
    var m = media.findOne(mediaid);
    var prefix = settings.findOne({key: 'mediadir'}).value;

    var type = MIME.lookup(m.location).split('/')[0];
    
    if (type == 'image') {
        gm(prefix + '/' + m.location)
            .resize(64, 64)
            .write(prefix + '/thumbs/' + m.location, Meteor.bindEnvironment(function (err) {
                if (err) console.log(err);
                media.update(m, {$set: {type: 'image', thumbnail: 'thumbs/' + m.location}});
        }.bind(this)));
    }
    
    else if (type == 'audio') {        
        ffmpeg.ffprobe(prefix + m.location, Meteor.bindEnvironment(function (err, metadata) {
            if (err) {console.log(err); return;}
        
            if (metadata.format['tags'] !== undefined) {
                if (metadata.format.tags['title'] !== undefined) {
                    media.update(m, {$set: {title: metadata.format.tags.title}});
                }
            }
            
            media.update(m._id, {$set: {type: 'audio', duration: metadata.format.duration}});
            
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
        }.bind(this)));
    }
}

Meteor.startup(function () {
    var dir = settings.findOne({key: 'mediadir'}).value;
    UploadServer.init({
        uploadDir: dir,
        tmpDir: dir + '/tmp',
        finished: process_media
    })
});
