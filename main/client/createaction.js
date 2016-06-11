create_action = function (col, _id) {
    var action = {
        args: {},
        settings: {
            triggers: true
        }
    };

    if (col == 'media') {
        action.type = 'media';
        action.media = _id;
        var m = media.findOne(action.media);
        action.defaulttitle = m.title;
        action.mediatype = m.type;
        action.layer = m.layer;
    }
    
    if (col == 'mediaplaylists') {
        action.type = 'playlist';
        action.playlist = _id;
        var p = mediaplaylists.findOne(action.playlist);
        action.defaulttitle = p.title;
        if (p.contents.length > 0) action.layer = media.findOne(p.contents[0]).layer;
        else action.layer = 'background'; // TODO figure out a more sensible default!
    }
    
    else if (col == 'lights') {
        action.type = 'light';
        action.light = _id;

        var light = lights.findOne(action.light)
        action.defaulttitle = light.title;

        action.settings.values = [];
        light.channels.forEach((channel) => {action.settings.values.push(0)});
    }

    else if (col == 'lightgroups') {
        action.type = 'lightgroup';
        action.lightgroup = _id;

        var group = lightgroups.findOne(action.lightgroup)
        action.defaulttitle = group.title;

        action.settings.values = [];
        group.channels.forEach((channel) => {action.settings.values.push(0)});
    }
    
    else if (col == 'lightscenes') {
        action.type = 'lightscene';
        action.lightscene = _id;
        action.defaulttitle = lightscenes.findOne(action.lightscene).title;
    }
    
    else if (col == 'songs') {
        action.type = 'song';
        action.song = _id;
        var s = songs.findOne(action.song)
        action.settings.key = s.key;
        action.defaulttitle = s.title;
        action.settings.arrangement = songarrangements.findOne({song: action.song})._id;
        action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
    }
    
    else if (col == 'presentations') {
        action.type = 'presentation';
        action.presentation = _id;
        action.defaulttitle = presentations.findOne(action.presentation).title;
        action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
    }
    
    else if (col == 'sequences') {
        action.type = 'sequence';
        action.sequence = _id;
        action.defaulttitle = sequences.findOne(action.sequence).title;
        action.settings.sequence_channel = 'default';
    }
    
    else if (col == 'special') {
        if (_id == 'clear-layer') {
            action.type = 'clear-layer';
            action.defaulttitle = 'Clear Layer';
            action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
        }
        
        else if (_id == 'clear-channel') {
            action.type = 'clear-channel';
            action.defaulttitle = 'Clear Channel';
            action.settings.sequence_channel = 'default';
        }
        
        else if (_id == 'timer') {
            action.type = 'timer';
            action.defaulttitle = 'Timer';
            action.layer = 'foreground'; // TODO same as above!
            action.settings.timer_time = {hours: 0, minutes: 0, seconds: 0};
        }
    }

    return action;
};
