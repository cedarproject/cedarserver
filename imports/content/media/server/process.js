import { Meteor } from 'meteor/meteor';
import { Media, Playlists, MediaFiles } from '../collections.js';

const fs = require('fs');
const spawn = require('child_process').spawn;

// TODO this whole thing should _probably_ happen over the network

function add_thumb_or_poster (which, media_id, path) {
    fs.readFile(path, (error, data) => {
        if (error) {
            throw error;
        } else {
            MediaFiles.write(data, {
                fileName: `${which}.jpg`,
                type: 'image/jpg'
            }, (error, file) => {
                if (error) {
                    throw error;
                } else {
                    let s = {};
                    s[which] = file._id;
                    Media.update(media_id, {$set: s});
                }
                
                fs.unlink(path, () => {});
            });
        }
    });
}

let media_jobs_counter = 0;

function process_media (media_id, _file) {
    if (media_jobs_counter > 4) { // TODO determine this value either from CPU cores or from Cedar settings
        Meteor.setTimeout(process_media.bind(null, media_id, _file), 1000);
    } else {
        media_jobs_counter++;
        
        Media.update(media_id, {$set: {status: 'analyzing'}});

        const file = MediaFiles.findOne(_file._id); // Provided _file object doesn't have link() function
        
        let proc = spawn('python3', [Assets.absoluteFilePath('mediatool/main.py'), media_id, file.link()]);
        
        proc.stdout.setEncoding('utf-8');
        proc.stderr.setEncoding('utf-8');

        let calls = 0;
        proc.stdout.on('data', Meteor.bindEnvironment((data) => {
            // If messages arrive faster than this handler grabs them then multiple messages will be received, so just get the most recent
            let last = data.slice(data.slice(0, -1).lastIndexOf('\n') + 1, -1); // I miss Python right about now
            console.log(last, calls++);
            let message = JSON.parse(last);
            
            if (message.hasOwnProperty('progress')) {
                Media.update(media_id, {$set: {status: media.progress}});
            } else if (message.hasOwnProperty('result')) {
                if (message.result.poster && message.result.thumb) {
                    add_thumb_or_poster('poster', media_id, message.result.poster);
                    add_thumb_or_poster('thumb', media_id, message.result.thumb);
                }

                Media.update(media_id, {$set: {
                    status: 'ready',
                    type: message.result.type,
                    tracks: message.result.tracks,
                    metadata: message.result.metadata
                }});
            }
        }));
        
        proc.stderr.on('data', data => console.error(data));
        
        proc.stdout.on('end', () => {
            media_jobs_counter--;
        });
    }
}
                

MediaFiles.addListener('afterUpload', function (file) {
    // TODO transform titles and add tags if requested by user
    let media_id = Media.insert({
        _upload_id: file.meta.upload_id,
        title: file.name,
        tags: [],
        type: 'new',
        status: 'waiting',
        percentage: 0,
        tracks: [],
        metadata: {},
        file: file._id,
        poster: null,
        thumbnail: null,
        added: new Date(),
        played: null
    });
    
    process_media(media_id, file);
});
