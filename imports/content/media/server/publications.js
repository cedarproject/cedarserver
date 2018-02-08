import { Meteor } from 'meteor/meteor';
import { is_viewer } from '/imports/lib/accounts/role_helpers.js';
import { Media, Playlists } from '../collections.js';

Meteor.publish('media.all', function () {
    if (is_viewer(this)) return Media.find();
});

// Paginated for infinite scrolling, optionally filtered by a search string and tags
Meteor.publish('media.view', function (search, tags, skip, limit) {
    if (is_viewer(this)) {
        let query = {};
        
        if (search) query['$text'] = {$search: search};
        if (tags && tags.length > 0) query['tags'] = {$all: tags};

        
        return Media.find(query, {
            sort: [['title', 'asc']],
            fields: {tracks: 0, metadata: 0},
            skip: skip,
            limit: limit
        });
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
