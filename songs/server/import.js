import_song = function (fileInfo, formData) {
    var prefix = settings.findOne({key: 'mediadir'}).value;
    var path = prefix + '/' + fileInfo.name;
    
    var fs = Npm.require('fs');
    var songstring = fs.readFileSync(path, {encoding: 'utf-8'});
    
    var song = EJSON.parse(songstring);
    
    songs.insert(song.song);
    
    for (var i in song.sections)
        songsections.insert(song.sections[i]);
    
    for (var i in song.arrangements)
        songarrangements.insert(song.arrangements[i]);
        
    fs.unlink(path, function () {});
}
