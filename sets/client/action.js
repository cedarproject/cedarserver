Template.setAction.helpers({
    actionType: function (type) {
        if (this.type == type) {
            return true;
        } else {
            return false;
        }
    },
    
    getMedia: function () {
        return media.findOne(this.media);
    },
    
    getLight: function () {
        return lights.findOne(this.light);
    },
    
    getLightGroup: function () {
        return lightgroups.findOne(this.lightgroup);
    },

    isActive: function () {
        var action = Template.parentData();
        var set = Template.parentData(2);
        
        if (set.active == action._id) {
            return 'bg-primary';
        } else {
            return '';
        }
    }    
});

Template.setAction.events({
    'click .settings-button': function (event) {
        event.stopImmediatePropagation();
        return true;
    },
});
