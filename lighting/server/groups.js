function checkGroup(groupid) {
    var group = lightgroups.findOne(groupid);
    if (!group) {
        throw new Meteor.Error('group-not-found', "Can't find a group with _id " + groupid);
    }
    
    return group;
}

function updateChannels(groupid) {
    var group = lightgroups.findOne(groupid);

    var newChannels = [];
    var newValues = [];
    
    for (var l in group.members) {
        var light = lights.findOne(group.members[l]);
        if (!light) continue;
                
        for (var c in light.channels) {
            var lc = light.channels[c];
            
            var isInNew = false;
            for (var n in newChannels) {
                if (lc.type == newChannels[n].type) {
                    isInNew = true;
                    break;
                }
            }
            if (isInNew) continue;
            
            var added = false;
            for (var g in group.channels) {
                var gc = group.channels[g];
                
                if (lc.type == gc.type) {
                    newChannels.push(gc);
                    newValues.push(group.values[g]);
                    added = true;
                    break;
                }
            }
            
            if (!added) {
                newChannels.push({type: lc.type});
                newValues.push(0);
            }
        }
    }
    
    lightgroups.update(group, {$set: {channels: newChannels, values: newValues}});
}

Meteor.methods({
    lightGroupNew: function () {
        var groupid = lightgroups.insert({
            title: 'New Group',
            members: [],
            channels: [],
            values: [],
        });
    },
    
    lightGroupDel: function (groupid) {
        var group = checkGroup(groupid);
        lightgroups.remove(group);
    },
    
    lightGroupTitle: function (groupid, title) {
        var group = checkGroup(groupid);
        lightgroups.update(group, {$set: {title: title}});
    },
    
    lightGroupAddLight: function (groupid, lightid) {
        var group = checkGroup(groupid);
        var light = lights.findOne(lightid);

        if (group.members.indexOf(lightid) == -1) {            
            lightgroups.update(group, {$push: {members: lightid}});
            updateChannels(groupid);
        }
    },
    
    lightGroupRemoveLight: function (groupid, lightid) {
        var group = checkGroup(groupid);
        
        lightgroups.update(group, {$pull: {members: lightid}});
        updateChannels(groupid);
    },
    
    lightGroupValues: function (groupid, values) {
        var group = checkGroup(groupid);
        
        lightgroups.update(group, {$set: {values: values}});
        
        for (var i in group.members) {
            var light = lights.findOne(group.members[i]);
            if (!light) continue;
            
            var lightValues = [];
            
            for (var n in light.channels) {
                var channel = light.channels[n];
                lightValues[n] = values[n] || light.values[n] || 0;
            }
            
            Meteor.call('lightValues', group.members[i], lightValues);
        }
    }
});
