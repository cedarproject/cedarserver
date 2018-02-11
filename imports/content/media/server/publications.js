import { Meteor } from 'meteor/meteor';
import { publishComposite } from 'meteor/reywood:publish-composite';

import { is_viewer, is_editor } from '/imports/lib/accounts/role_helpers.js';
import { Media, Playlists, MediaFiles } from '../collections.js';

Meteor.publish('media.all', function () {
    if (is_viewer(this)) return Media.find();
});

// Paginated for infinite scrolling, optionally filtered by a search string and tags
publishComposite('media.view', function (search, tags, skip, limit) {
    return {
        find() {
            if (is_viewer(this)) {
                let query = {};
                
                if (search) query['$text'] = {$search: search};
                if (tags && tags.length > 0) query['tags'] = {$all: tags};
                
                return Media.find(query, {
                    fields: {tracks: 0, metadata: 0},
                    skip: skip,
                    limit: limit
                });
            }
        },
        
        children: [{
            find(media) {
                if (media.thumb) {
                    return MediaFiles.find({_id: media.thumb}).cursor;
                } else {
                    return;
                }
            }
        }]
    }
});

// Media uploaded as a group, displayed in the Upload UI
publishComposite('media.upload', function (upload_id) {
    return {
        find() {
            if (is_editor(this)) {
                return Media.find({_upload_id: upload_id});
            }
        },
        
        children: [{
            find(media) {
                if (media.thumb) {
                    return MediaFiles.find({_id: media.thumb}).cursor;
                } else {
                    return;
                }
            }
        }]
    }
});

Meteor.publish('media.one', function (media_id) {
    if (is_viewer(this)) return Media.find({_id: media_id});
});


// Playlist _ids and titles, no content
Meteor.publish('playlists.list', function () {
    if (is_viewer(this)) return Playlists.find({}, {fields: {_id: 1, title: 1}});
});

Meteor.publish('playlists.all', function () {
    if (is_viewer(this)) return Playlists.find();
});

Meteor.publish('playlists.one', function (playlist_id) {
    if (is_viewer(this)) return Playlists.find({_id: playlist_id});
});
