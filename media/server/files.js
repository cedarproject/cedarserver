function process_media(fileInfo, formFields) {
    media.insert({
        title: fileInfo.name,
        location: fileInfo.name,
        type: null,
        duration: null,
        thumbnail: null,
        tags: []
    });
        
    ffmpeg.ffprobe(settings.findOne({key: 'mediadir'}).value + '/' + 
                   fileInfo.name, Meteor.bindEnvironment(function (err, metadata) {
        if (err) {
            console.log(err);
            return;
        }
    
        var filename = metadata.format.filename.split('/').pop()
        
        var m = media.findOne({location: filename});
        if (metadata.format['tags'] !== undefined) {
            if (metadata.format.tags['title'] !== undefined) {
                media.update(m, {$set: {title: metadata.format.tags.title}});
            }
        }

        var t = null;
        metadata.streams.forEach(function (stream, index, array) {
            if (stream.codec_type == 'video') {
                if (stream.duration_ts == 1) {
                    t = 'image';
                }
                else {
                    t = 'video';
                }
            }
            else if (stream.codec_type == 'audio' && !t) {
                t = 'audio';
            }
        });
        
        if (t) {
            media.update(m._id, {$set: {type: t, duration: metadata.format.duration}});
            if (t == 'image') {
                media.update(m._id, {$set: {blah: 'blah!', thumbnail: filename}});
            }
            else if (t == 'video') {
                ffmpeg(metadata.format.filename).on('end', Meteor.bindEnvironment(function () {
                    var m = media.findOne({location: filename});
                    media.update(m, {$set: {thumbnail: 'thumbs/' + filename + '.png'}});                    
                })).screenshots({
                    count: 1,
                    timestamps: [1],
                    folder: settings.findOne({key: 'mediadir'}).value + '/thumbs/',
                    filename: filename + '.png',
                    size: '64x64'
                });
            }
        }
    }));
}

Meteor.startup(function () {
    var dir = settings.findOne({key: 'mediadir'}).value;
    UploadServer.init({
        uploadDir: dir,
        tmpDir: dir + '/tmp',
        finished: process_media
    })
});
