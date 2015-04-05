Template.set.helpers({
    stageTitle: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) return stage.title;
        else return 'Unassigned';
    },
    
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },
    
    actions: function () {
        return actions.find({set: this._id}, {sort: {order: 1}});
    },
});

// TODO fix -- this is complicated
/*Template.set.onRendered(function () {
    $('body').keypress(function (event, set) {
        console.log(event.key);
        console.log(this);
        var set = this;
        if (set.active) {
            if (event.key == 'ArrowUp' || event.key == 'Up' &&
                    set.active > 0) {
                var currAction = actions.findOne(set.active);
                var prevAction = actions.findOne({order: currAction.order - 1});
                if (prevAction) Meteor.call('setActivate', set._id, prevAction._id);
            }

            else if (event.key == 'ArrowDown' || event.key == 'Down' && 
                    set.active < this.actions.length - 1) {
                var currAction = actions.findOne(set.active);
                var nextAction = actions.findOne({order: currAction.order + 1});
                if (nextAction) Meteor.call('setActivate', set._id, nextAction._id);
            }
        }
    }, Template.currentData());
});*/

Template.set.events({    
    'click .set-action': function (event) {
        var set = Template.parentData();
        var actionindex = set.actions.indexOf(this);
        if (actionindex != set.active) {
            Meteor.call('setActivate', set._id, actionindex);
        };
        return false;
    },
    
    'click .set-add-item': function (event) {
        $(event.target).siblings('.action-selector-modal').modal('show');
    },

    'click .media-item-add': function (event) {
        var mediaid = $(event.target).data('mediaid');
        var mediatype = media.findOne(mediaid).type;
        var setid = Template.parentData()._id;

        var a = actions.findOne({set: setid}, {sort: {order: -1}, fields: {order: 1}});
        if (a) var order = a.order + 1;
        else var order = 0;

        Meteor.call('actionAdd', {
            set: setid,
            order: order,
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
