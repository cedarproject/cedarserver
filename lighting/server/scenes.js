function checkScene(sceneid) {
    var scene = lightscenes.findOne(sceneid);
    if (!scene) {
        throw new Meteor.Error('scene-not-found', "Can't find a scene with _id " + sceneid);
    }
    
    return scene;
}

Meteor.methods({
    'sceneAdd': function () {
        var sceneid = lightscenes.insert({
            title: 'New Scene',
            lights: []
        });
        
        return sceneid;
    },
    
    'sceneDel': function (sceneid) {
        var scene = checkScene(sceneid);
        lightscenes.remove(scene);
    },
    
    'sceneTitle': function (sceneid, title) {
        var scene = checkScene(sceneid);
        lightscenes.update(scene, {$set: {title: title}});
    },
    
    'sceneAddLight': function (sceneid, lightid) {
        var scene = checkScene(sceneid);
        var light = {light: lightid, value: {}};
        lightscenes.update(scene, {$push: {lights: light}});
    },
    
    'sceneAddGroup': function (sceneid, groupid) {
        var scene = checkScene(sceneid);
        var group = {group: groupid,value: {}};
        lightscenes.update(scene, {$push: {lights: group}});
    },

    'sceneDelLight': function (sceneid, index) {
        var scene = checkScene(sceneid);
        lightscenes.update(scene, {$pull: {lights: scene.lights[index]}});
    },
    
    'sceneSetValue': function (sceneid, index, value) {
        var scene = checkScene(sceneid);
        var selector = {}; selector['lights.' + index + '.value'] = value;
        lightscenes.update(scene, {$set: selector});
    },
    
    'sceneActionActivate': function (action) {
        var scene = checkScene(action.lightscene);
        
        for (var i in scene.lights) {
            var l = scene.lights[i];
            if (l['light']) Meteor.call('lightValues', l.light, l.value);
            else if (l['group']) Meteor.call('lightGroupValues', l.group, l.value);
        }
    }
});
