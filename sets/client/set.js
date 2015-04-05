Template.set.helpers({
    stageTitle: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) return stage.title;
        else return 'Unassigned';
    },
    
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },
    
    actionType: function (type) {
        if (type == this.type) {
            return true;
        } else {
            return false;
        }
    }
});

Template.set.events({
    // TODO: figure out how to properly attach the keydown handler to this function
    'keydown': function (event) {
        console.log(event.key);
        if (this.active) {
            if (event.key == 'ArrowUp' || event.key == 'Up' &&
                    this.active > 0) {
                Meteor.call('setActivate', set._id, set.active + 1);
            }

            else if (event.key == 'ArrowDown' || event.key == 'Down' && 
                    this.active < this.actions.length - 1) {
                Meteor.call('setActivate', set._id, set.active + 1);
            }
        }
    },
    
    'click .set-action': function (event) {
        var set = Template.parentData();
        var actionindex = set.actions.indexOf(this);
        if (actionindex != set.active) {
            Meteor.call('setActivate', set._id, actionindex);
        };
    },
    
    'click .set-add-item': function (event) {
        $(event.target).siblings('.action-selector-modal').modal('show');
    },

    'click .media-item-add': function (event) {
        var mediaid = $(event.target).data('mediaid');
        var mediatype = media.findOne(mediaid).type;
        var stageid = Template.parentData()._id;
        Meteor.call('setAdd', stageid, {
            type: 'media',
            media: mediaid,
            mediatype: mediatype,
            role: 'background',
            minions: [],
            triggers: [],
            options: {}
        });
        
        $(event.target).parents('.modal').modal('hide');
        return false;
    },

    'click .set-clear': function (event) {
        Meteor.call('setDeactivate', this._id);
    },

    'click .set-settings': function (event) {
        $(event.target).parent().siblings('.set-settings-modal').modal('show');
    },
    
    'click .set-settings-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .set-settings-save': function (event) {
        var modalbody = $(event.target).parent().prev('.modal-body');
        
        var newtitle = modalbody.children('.set-title').val();
        if (newtitle) Meteor.call('setTitle', this._id, newtitle);
        
        var stageid = modalbody.children('.set-stage').val();
        if (stageid) Meteor.call('setStage', this._id, stageid);

        modalbody.parents('.modal').modal('hide');
    },
    
    'click .set-settings-delete': function (event) {
        var settingsmodal = $(event.target).parents('.modal');
        settingsmodal.modal('hide');
        settingsmodal.next('.modal').modal('show');
    },
    
    'click .set-delete-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .set-delete-confirm': function (event) {
        $(event.target).parents('.modal').modal('hide');
        Meteor.call('setDelete', this._id);
        Router.go('/sets');
    },
});
