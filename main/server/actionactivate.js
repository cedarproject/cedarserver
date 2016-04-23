action_activate = function (action) {
    if (action.set) action.stage = sets.findOne(action.set).stage;
    else if (action.schedule) action.stage = schedules.findOne(action.schedule).stage;
    
    if (action.type == 'media' || action.type == 'playlist' ||
        action.type == 'clear-layer' || action.type == 'timer' ||
        action.type == 'song' || action.type == 'presentation') {

        var l = {}; l['layers.' + action.layer] = action;
        stages.update(action.stage, {$set: l});
    }
    
    else if (action.type == 'lightscene') {
        Meteor.call('sceneActionActivate', action);
    }
};
