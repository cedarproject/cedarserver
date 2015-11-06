var checkPlaylist = function (playlistid) {
    var p = mediaplaylists.findOne(playlistid);
    if (p) return p;
    else throw new Meteor.Error('playlist-not-found', 'Could not find playlist with the _id: ' + playlistid);
};

Meteor.methods({
    playlistNew: function () {
        return mediaplaylists.insert({
            title: 'New Playlist',
            tags: [],
            settings: {},
            contents: []
        });
    },
    
    playlistTitle: function (playlistid, title) {
        var playlist = checkPlaylist(playlistid);
        mediaplaylists.update(playlist, {$set: {title: title}});
    },
    
    playlistAddTags: function (playlistid, tags) {
        var playlist = checkPlaylist(playlistid);
        mediaplaylists.update(playlist, {$push: {tags: {$each: tags}}});
    },
    
    playlistDelTag: function (playlistid, tag) {
        var playlist = checkPlaylist(playlistid);
        mediaplaylists.update(playlist, {$pull: {tags: tag}});
    },
    
    playlistDel: function (playlistid) {
        var playlist = checkPlaylist(playlistid);
        mediaplaylists.remove(playlist);
    },
    
    playlistContents: function (playlistid, contents) {
        var playlist = checkPlaylist(playlistid);
        mediaplaylists.update(playlist, {$set: {contents: contents}});
    }
});
