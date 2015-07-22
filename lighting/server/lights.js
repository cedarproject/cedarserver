function checkLight(lightid) {
    var light = lights.findOne(lightid);
    if (!light) {
        throw new Meteor.Error('light-not-found', "Can't find a light with _id " + lightid);
    }
    
    return light;
}

Meteor.methods({
    lightNew: function () {
        var lightid = lights.insert({
            title: 'New Light',
            minion: null,
            stage: null,
            enabled: true,
            channels: [],
            values: [],
        });
        
        return lightid;
    },
    
    lightClone: function (lightid) {
        var light = checkLight(lightid);
        delete light._id;
        light.title = 'Copy of ' + light.title;
        lights.insert(light);
    },
    
    lightDelete: function (lightid) {
        var light = checkLight(lightid);
        lights.remove(light);
    },
    
    lightTitle: function (lightid, title) {
        var light = checkLight(lightid);
        lights.update(light, {$set: {title: title}});
    },
    
    lightMinion: function (lightid, minionid) {
        var light = checkLight(lightid);
        var stageid = minions.findOne(minionid).stage;
        lights.update(light, {$set: {minion: minionid, stage: stageid}});
    },
    
    lightEnabled: function (lightid, enabled) {
        var light = checkLight(lightid);
        lights.update(light, {$set: {enabled: enabled}});
    },
    
    lightChannels: function (lightid, channels) {
        var light = checkLight(lightid);

        lights.update(light, {$set: {channels: channels}});
    },
    
    lightValues: function (lightid, values, settings) {
        var light = checkLight(lightid);
        
        settings.time = (Date.now() * 0.001) + 0.1; // Get current time as float, add 100ms

        if (!light.disabled) lights.update(light, {$set: {values: values, settings: settings}});
    }
});
