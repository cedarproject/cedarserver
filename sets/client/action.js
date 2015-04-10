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
        
        if (set.active == action._id) {
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
        $(event.target).parents('.modal').modal('hide');
        var set = Template.parentData();
        Meteor.call('actionRemove', this._id);
        return false;
    }
});
