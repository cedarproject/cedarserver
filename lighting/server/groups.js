function checkGroup(groupid) {
    var group = lightgroups.findOne(groupid);
    if (!group) {
        throw new Meteor.Error('group-not-found', "Can't find a group with _id " + groupid);
    }
    
    return group;
}

Meteor.methods({
    lightGroupNew: function () {
        var groupid = lightgroups.insert({
            title: 'New Group',
            members: []
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
        if (group.members.indexOf(lightid) == -1) {
            lightgroups.update(group, {$push: {members: lightid}});
        }
    },
    
    lightGroupRemoveLight: function (groupid, lightid) {
        var group = checkGroup(groupid);
        lightgroups.update(group, {$pull: {members: lightid}});
    },
    
    lightGroupValues: function (groupid, values) {
        var group = checkGroup(groupid);
        
        for (var i in group.lights) {
            Meteor.call('lightSetValues', group.lights[i], values);
        }
    }
});
