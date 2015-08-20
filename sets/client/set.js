Template.set.helpers({
    stageTitle: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) return stage.title;
        else return 'Unassigned';
    },
    
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },
    
    getLayers: function () {
        return stages.findOne({_id: this.stage}).settings.layers;
    },
    
    actions: function () {
        return actions.find({set: this._id}, {sort: {order: 1}});
    },
    
    plusOne: function (n) {
        return n + 1;
    },
    
    isActive: function () {
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
        $('.set-action').removeClass('moving').removeClass('movetarget').removeClass('disabled');
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
        
    'click .set-action': function (event) {
        if ($(event.target).hasClass('btn')) return;
        var set = Template.parentData();
        if (this._id != set.active) {
            Meteor.call('actionArgs', this._id, {}); // Reset Song/Presentation active slide index.
            Meteor.call('setActivate', set._id, this._id);
        };
//        return false;
    },
    
    'click .song-content': function (event, template) {
        event.stopImmediatePropagation();
        var args = {
            section: this.section,
            index: this.index,
            number: this.number
        };
        
        Meteor.call('actionArgs', this.action, args);
        Meteor.call('setActivate', template.data._id, this.action);        
    },
    
    'click .set-add-item': function (event, template) {
        Session.set('add-to', {type: 'set'});
        template.$('.action-selector-modal').modal('show');
    },
    
    'click .collection-add': function (event, template) {    
        var action = {
            args: {},
            settings: {}
        };
        
        var a = actions.findOne({set: action.set}, {sort: {order: -1}, fields: {order: 1}});
        if (a) action.order = a.order + 1;
        else action.order = 0;
        
        var col = $(event.target).data('collection')
        if (col == 'media') {
            action.type = 'media';
            action.media = $(event.target).data('id');
            var m = media.findOne(action.media);
            action.mediatype = m.type;
            action.layer = m.layer;
        }
        
        else if (col == 'lightscenes') {
            action.type = 'lightscene';
            action.lightscene = $(event.target).data('id');
        }
        
        else if (col == 'songs') {
            action.type = 'song';
            action.song = $(event.target).data('id');
            action.settings.arrangement = songarrangements.findOne({song: action.song})._id;
            action.settings.layer = 'foreground';
        }
        
        if (Session.get('add-to')['type'] == 'set') action['set'] = template.data._id;
        else action['actionid'] = Session.get('add-to').action;
        
        Meteor.call('actionAdd', action);
                    
        $(event.target).parents('.modal').modal('hide');
        return false;
    },

    'click .set-clear-layer': function (event, template) {
        Meteor.call('setClearLayer', template.data._id, this.toString());
    },

    'click .set-deactivate': function (event) {
        Meteor.call('setDeactivate', this._id);
        $('.song-content').removeClass('active');
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
    
    'click .set-delete-confirm': function (event, template) {
        $(event.target).parents('.modal').removeClass('fade').modal('hide');
        Meteor.call('setDelete', template.data._id);
        Router.go('/sets');
    },
});
