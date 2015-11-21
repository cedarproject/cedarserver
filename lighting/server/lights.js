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
        
        var t = light.title.split(' ');
        if (!isNaN(parseInt(t[t.length-1]))) {
            t[t.length-1] = parseInt(t[t.length-1]) + 1;
            light.title = t.join(' ');
        } else light.title = light.title + ' (copy)';

        return lights.insert(light);
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
        
        for (var c in light.channels) {
            if (light.channels[c].type == 'fixed') values[c] = light.channels[c].value;
        }
        
        if (!settings['time']) settings.time = Date.now();

        if (!light.disabled) lights.update(light, {$set: {values: values, settings: settings}});
    }
});
