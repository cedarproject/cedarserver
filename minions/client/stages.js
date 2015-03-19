Template.stagesList.helpers({
    stages: function () {
        return stages.find();
    }
});

Template.stagesList.events({
    'click .stages-new': function (event) {
        Meteor.call('stageNew');
    },
    
    'click .stage-settings': function (event) {
        $(event.target).parent().next('.modal').modal('show');
    },
    
    'click .stage-settings-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .stage-settings-save': function (event) {
        var modalbody = $(event.target).parent().prev('.modal-body');
        
        var newtitle = modalbody.children('.stage-title').val();
        Meteor.call('stageTitle', this._id, newtitle);

        modalbody.parents('.modal').modal('hide');
    },
    
    'click .stage-settings-delete': function (event) {
        var settingsmodal = $(event.target).parents('.modal');
        settingsmodal.modal('hide');
        settingsmodal.next('.modal').modal('show');
    },
    
    'click .stage-delete-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .stage-delete-confirm': function (event) {
        $(event.target).parents('.modal').modal('hide');
        Meteor.call('stageDelete', this._id);
    },
});
