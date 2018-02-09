import { Cedar } from '/imports/lib/connection';
import { Template } from 'meteor/templating';

import { Media, Playlists, MediaFiles } from '../collections.js';
import './media_browser.html';

Router.route('/media', function () {
    this.wait(Cedar.subscribe('playlists.list'));
    
    if (this.ready()) {
        this.render('media_browser', {
            data: function () {
                return Playlists.find({}, {sort: [['title', 'asc']]});
            }
        });
    } else {
        this.render('loading');
    }
}, {
    name: 'media.browser'
});

Template.media_browser.helpers({
    samplePlaylists() {
        let sample = [];
        
        for (let i = 1; i < 25; i++) {
            sample.push({title: `Test Playlist ${i}`});
        }
        
        return sample;
    },
    
    sampleMedia() {
        let sample = [];
        
        for (let i = 1; i < 25; i++) {
            sample.push({title: `Test Media ${i}`});
        }
        
        return sample;
    }
});
