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

    isActive: function () {
        var action = Template.parentData();
        var set = Template.parentData(2);
        console.log(set._id);
        
        if (set.active == set.actions.indexOf(action)) {
            return 'bg-primary';
        } else {
            return '';
        }
    }    
});

Template.setAction.events({
    'click .set-action-settings': function (event) {
        $(event.target).siblings('.set-action-modal').modal('show');
        return false;
    },
    
    'click .set-action-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
        return false;
    },
    
    'click .set-action-delete': function (event) {
        var set = Template.parentData();
        var actionindex = set.actions.indexOf(this);
        Meteor.call('setRemove', set._id, actionindex);
        $(event.target).parents('.modal').modal('hide');
        return false;
    }
});
