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
    
    plusOne: function (n) {
        return n + 1;
    },
    
    isActive: function (n) {
        if (Template.parentData()['active'] == this._id) return 'active';
    }
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
    'click .moving': function (event) {
        $('.set-action').removeClass('moving').removeClass('movetarget');
        event.stopImmediatePropagation();
        return false;
    },
    
    'click .movetarget': function (event) {
        var movingid = $('.set-action.moving').data('actionid');
        
        Meteor.call('actionMove', movingid, this.order);
        
        $('.set-action').removeClass('moving').removeClass('movetarget').removeClass('disabled');
        event.stopImmediatePropagation();
        return false;
    },

    'click .action-move': function (event) {
        if (!$(event.target).parents('.set-action').hasClass('movetarget')) {
            var target = $(event.target).parents('.set-action');
            target.addClass('moving');
            $('.set-action').not(target).addClass('movetarget').addClass('disabled');
        }
        event.stopImmediatePropagation();
        return false;
    },
    
    'click .settings-button': function (event) {
        event.stopImmediatePropagation();
        return true;
    },
    
    'click .set-action': function (event) {
        var set = Template.parentData();
        if (this._id != set.active) {
            Meteor.call('setActivate', set._id, this._id);
        };
        return false;
    },
    
    'click .set-add-item': function (event) {
        $(event.target).siblings('.action-selector-modal').modal('show');
    },

    'click .collection-add': function (event) {
        if ($(event.target).data('collection') == 'media') {
            var mediaid = $(event.target).data('id');
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
                options: {}
            });
        }
            
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
