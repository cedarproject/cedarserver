import { Template } from 'meteor/templating';
import { Media, MediaFiles } from '../collections.js';

import './media_header.html';

Template.media_header.helpers({
    thumbURL() {
        if (this.thumb) {
            let file = MediaFiles.findOne({_id: this.thumb});
            if (file) return file.link();
        }

        // TODO make a default thumb for each media type
        return '';
    }
});
