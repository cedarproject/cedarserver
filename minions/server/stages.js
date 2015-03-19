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
            active: null
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
        stages.update(stage, {title: newtitle});
    }
});
