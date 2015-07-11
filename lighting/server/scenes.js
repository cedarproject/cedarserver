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
    
    'sceneClone': function (sceneid) {
        var scene = checkScene(sceneid);
        delete scene._id;
        scene.title = 'Copy of ' + scene.title;
        lightscenes.insert(scene);
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
        var values = [];
        lights.findOne(lightid).channels.forEach(function () {values.push(0)});
        
        var light = {light: lightid, values: values};
        lightscenes.update(scene, {$push: {lights: light}});
    },
    
    'sceneAddGroup': function (sceneid, groupid) {
        var scene = checkScene(sceneid);
        var values = [];     
        lightgroups.findOne(groupid).channels.forEach(function () {values.push(0)});
        
        var group = {group: groupid, values: values};
        lightscenes.update(scene, {$push: {lights: group}});
    },

    'sceneDelLight': function (sceneid, index) {
        var scene = checkScene(sceneid);
        lightscenes.update(scene, {$pull: {lights: scene.lights[index]}});
    },
    
    'sceneSetValue': function (sceneid, index, values) {
        var scene = checkScene(sceneid);
        var selector = {}; selector['lights.' + index + '.values'] = values;
        lightscenes.update(scene, {$set: selector});
    },
    
    'sceneActivate': function (sceneid) {
        var scene = checkScene(sceneid);

        for (var i in scene.lights) {
            var l = scene.lights[i];
            if (l['light']) Meteor.call('lightValues', l.light, l.values);
            else if (l['group']) Meteor.call('lightGroupValues', l.group, l.values);
        }
    },
    
    'sceneActionActivate': function (action) {
        // TODO this will eventually set fade time, etc.
        Meteor.call('sceneActivate', action.lightscene);
    }
        
});
