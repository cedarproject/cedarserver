Template.minion.helpers({
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },
    
    titleOf: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) {return stage.title;}
        else {return 'Unassigned';}
    },
    
    getSetting: function (setting) {
        return this.settings[setting];
    }
});

Template.minion.events({
    'click .minion-settings': function (event) {
        $(event.target).parent().next('.modal').modal('show');
    },
    
    'click .minion-settings-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .minion-settings-save': function (event) {
        var modalbody = $(event.target).parent().prev('.modal-body');
        
        var newname = modalbody.children('.minion-name').val();
        Meteor.call('minionName', this._id, newname);

        var stageid = modalbody.children('.minion-stage').val();
        if (stageid) Meteor.call('minionStage', this._id, stageid);
        
        modalbody.parents('.modal').modal('hide');
    },
    
    'click .minion-settings-delete': function (event) {
        var settingsmodal = $(event.target).parents('.modal');
        settingsmodal.modal('hide');
        settingsmodal.next('.modal').modal('show');
    },
    
    'click .minion-delete-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .minion-delete-confirm': function (event) {
        $(event.target).parents('.modal').modal('hide');
        Meteor.call('minionDelete', this._id);
    },
});
