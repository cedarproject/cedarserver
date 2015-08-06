function checkSong(songid) {
    var song = songs.findOne(songid);
    if (song) return song;
    else throw new Meteor.Error('song-not-found', "Couldn't find song with _id: " + songid);
}

Meteor.methods({
    songNew: function () {
        var songid = songs.insert({
            title: 'New Song',
            tags: [],
            // TODO add author/copyright metadata!
        });
        return songid;
    },
    
    songDel: function (songid) {
        var song = checkSong(songid);
        songs.remove(song);
    },
    
    songTitle: function (songid, title) {
        var song = checkSong(songid);
        songs.update(song, {$set: {title: title}});
    },
    
    songAddSection: function (songid) {
        var song = checkSong(songid);
        var sectionid = songsections.insert({
            song: songid,
            title: 'New Section',
            triggers: [],
            contents: []
        });
        return sectionid;
    },
    
    songDelSection: function (songid, sectionid) {
        var song = checkSong(songid);
        songsections.remove(sectionid);
        songarrangements.update({song: songid}, {$pull: {order: sectionid}}, {multi: true});
    },
    
    songSectionTitle: function (sectionid, title) {
        songsections.update(sectionid, {$set: {title: title}});
    },
    
    songSectionAddContent: function (sectionid) {
        songsections.update(sectionid, {$push: {contents: {
            text: '',
            triggers: []
        }}});
    },
    
    songSectionDelContent: function (sectionid, index) {
        var content = songsections.findOne(sectionid).content[index];
        songsections.update(sectionid, {$pull: {content: content}});
    },
    
    songSectionChangeContent: function (sectionid, index, text) {
        var val = {};
        val['contents.' + index + '.text'] = text;
        songsections.update(sectionid, {$set: val});
    },
        
    songSectionContentAddTrigger: function (sectionid, index, trigger) {
        var val = {};
        val['contents.' + index + '.triggers'] = trigger;
        songsections.update(sectionid, {$push: val});
    },
    
    songSectionContentRemoveTrigger: function (sectionid, cindex, tindex) {
        var trigger = songsections.findOne(sectionid).contents[cindex].triggers[tindex];
        var val = {};
        val['contents.' + cindex + '.triggers'] = trigger;
        songsections.update(sectionid, {$pull: val});
    },
    
    songAddArrangement: function (songid) {
        var song = checkSong(songid);
        var arrid = songarrangements.insert({
            song: songid,
            title: 'New Arrangement',
            order: []
        });
        return arrid;
    },
    
    songDelArrangement: function (arrid) {
        songarrangements.remove(arrid);
    },
    
    songArrangementTitle: function (arrid, title) {
        songarrangements.update(arrid, {$set: {title: title}});
    },
    
    songArrangementAddSection: function (arrid, sectionid) {
        songarrangements.update(arrid, {$push: {order: sectionid}});
    },
    
    songArrangementDelSection: function (arrid, index) {
        // $pull would remove all instances of a Section instead of just one, so doing this way instead.
        var arr = songarrangements.findOne(arrid);
        var neworder = arr.order;
        neworder.splice(index, 1);
        songarrangements.update(arrid, {$set: {order: neworder}});
    },
    
    songActionActivate: function (action) {
        var set = sets.findOne(action.set);
        var targets = minions.find({stage: set.stage});
        
        action.time = (Date.now() * 0.001) + 0.1; // Get current time as float, add 100ms
        
        targets.forEach(function (minion) {
            minions.update(minion._id, {$pull: {actions: {type: 'song'}}});
            Meteor.call('minionAddAction', minion._id, action);
        });
    }
});
