action_activate = function (action) {
    if (action.set) action.stage = sets.findOne(action.set).stage;
    else if (action.schedule) action.stage = schedules.findOne(action.schedule).stage;
    
    if (action.type == 'media' || action.type == 'playlist' ||
        action.type == 'clear-layer' || action.type == 'timer' ||
        action.type == 'song' || action.type == 'presentation' ||
        action.type == 'presentationslide' || action.type == 'camera') {

        var l = {}; l['layers.' + action.layer] = action;
        stages.update(action.stage, {$set: l});
    }
    
    else if (action.type == 'light') {
        var settings = {
            time: action.time,
            fade: parseFloat(combineSettings(action.settings).lights_fade)
        };

        Meteor.call('lightValues', action.light, action.settings.values, settings);
    }
    
    else if (action.type == 'lightgroup') {
        var settings = {
            time: action.time,
            fade: parseFloat(combineSettings(action.settings).lights_fade)
        };

        Meteor.call('lightGroupValues', action.lightgroup, action.settings.values, settings);
    }
    
    else if (action.type == 'lightscene') {
        Meteor.call('sceneActionActivate', action);
    }
    
    else if (action.type == 'sequence') {
        Meteor.call('sequenceActionActivate', action);
    }

    else if (action.type == 'clear-channel') {
        Meteor.call('sequenceClearChannel', action.settings.sequence_channel);
    }
    
    else if (action.type == 'custom') {
        Meteor.call('customActionTriggered', action.settings.action_string || '');
    }
};
