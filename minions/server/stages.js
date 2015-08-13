function checkStage(stageid) {
    var stage = stages.findOne({_id: stageid});
    if (!stage) {
        throw new Meteor.Error('stage-not-found', "Can't find a stage with id: " + stageid);
    }

    return stage;
}

Meteor.methods({
    stageNew: function () {
        stages.insert({
            title: 'New Stage',
            active: null,
            settings: {
                layers: ['audio', 'background', 'foreground']
            }
        });
    },
    
    stageDelete: function (stageid) {
        var stage = checkStage(stageid);
        stages.remove(stage);
        minions.update({stage: stageid},
                       {$set: {stage: null}},
                       {multi: true});
    },
    
    stageTitle: function (stageid, newtitle) {
        var stage = checkStage(stageid);
        stages.update(stage, {$set: {title: newtitle}});
    },
    
    stageSetting: function (stageid, key, value) {
        var stage = checkStage(stageid);
        var s = {}; s['settings.' + key] = value;
        stages.update(stage, {$set: s});
    }
});
