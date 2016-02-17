action_activate = function (action) {
    if (action.set) action.stage = sets.findOne(action.set).stage;
    else if (action.schedule) action.stage = schedules.findOne(action.schedule).stage;
    
    if (action.type == 'media' || action.type == 'playlist' ||
        action.type == 'clear-layer' || action.type == 'timer') {
            Meteor.call('mediaActionActivate', action);
    }
    
    else if (action.type == 'lightscene') {
        Meteor.call('sceneActionActivate', action);
    }
    
    else if (action.type == 'song') {
        Meteor.call('songActionActivate', action);
    }
    
    else if (action.type == 'presentation') {
        Meteor.call('presentationActionActivate', action);
    }
};
