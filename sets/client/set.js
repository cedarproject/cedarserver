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
        if (this.stage) return stages.findOne({_id: this.stage}).settings.layers;
    },
    
    formatTime: function (time) {
        return moment(time).format('YYYY-MM-DD h:mm:ss a');
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
            Meteor.call('actionArgs', this._id, {});
            Meteor.call('setActivate', set._id, this._id);
        };
    },
    
    'click .song-content': function (event, template) {
        event.stopImmediatePropagation();
        var args = {
            section: this.section,
            index: this.index,
        };
        
        Meteor.call('actionArgs', this.action, args);
        Meteor.call('setActivate', template.data._id, this.action);
    },
    
    'click .presentation-content': function (event, template) {
        event.stopImmediatePropagation();
        
        var fillin = 0;
        if (template.data.active == this.action) {
            var action = actions.findOne(this.action);
            if (action.args.order == this.order) {
                fillin = action.args.fillin + 1;
                if (fillin > this.fillins) fillin = 0;
            }
        }
         
        var args = {
            order: this.order,
            fillin: fillin
        };
        
        Meteor.call('actionArgs', this.action, args);
        Meteor.call('setActivate', template.data._id, this.action);
    },

    'click .presentation-fillin': function (event, template) {
        event.stopImmediatePropagation();
        var args = {
            order: this.order,
            fillin: this.fillin
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
            settings: {
                triggers: true
            }
        };
                
        var col = $(event.target).data('collection');

        if (col == 'media') {
            action.type = 'media';
            action.media = $(event.target).data('id');
            var m = media.findOne(action.media);
            action.mediatype = m.type;
            action.layer = m.layer;
        }
        
        if (col == 'mediaplaylists') {
            action.type = 'playlist';
            action.playlist = $(event.target).data('id');
            var p = mediaplaylists.findOne(action.playlist);
            if (p.contents.length > 0) action.layer = media.findOne(p.contents[0]).layer;
            else action.layer = 'background'; // TODO figure out a more sensible default!
        }
        
        else if (col == 'lightscenes') {
            action.type = 'lightscene';
            action.lightscene = $(event.target).data('id');
        }
        
        else if (col == 'songs') {
            action.type = 'song';
            action.song = $(event.target).data('id');
            action.settings.arrangement = songarrangements.findOne({song: action.song})._id;
            action.settings.key = songs.findOne(action.song).key;
            action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
        }
        
        else if (col == 'presentations') {
            action.type = 'presentation';
            action.presentation = $(event.target).data('id');
            action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
        }
        
        else if (col == 'streamingsources') {
            action.type = 'streamingsource';
            action.source = $(event.target).data('id');
            action.layer = 'foreground'; // TODO blah
        }
        
        else if (col == 'special') {
            var special = $(event.target).data('id');
            
            if (special == 'clear-layer') {
                action.type = 'clear-layer';
                action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
            }
            
            if (special == 'timer') {
                action.type = 'timer';
                action.layer = 'foreground'; // TODO same as above!
                action.settings.timer_time = {hours: 0, minutes: 0, seconds: 0};
            }
        }
        
        if (Session.get('add-to')['type'] == 'set') {
            var a = actions.findOne({set: template.data._id}, {sort: {order: -1}, fields: {order: 1}});
            if (a) action.order = a.order + 1;
            else action.order = 0;

            action['set'] = template.data._id;
        }

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

    'click #settings-toggle': function (event, template) {
        template.$('#set-settings').collapse('toggle');
    },
    
    'blur .set-title': function (event, template) {
        Meteor.call('setTitle', template.data._id, $(event.target).val());
    },
    
    'change .set-stage': function (event, template) {
        Meteor.call('setStage', template.data._id, $(event.target).val());
    },
    
    'click .set-time-add': function (event, template) {
        var times = template.data.settings.times;
        times.push(new Date());
        Meteor.call('setSetting', template.data._id, 'times', times);
    },
    
    'change .set-time': function (event, template) {
        var times = template.data.settings.times;
        times[times.indexOf(this)] = event.date.toDate();
        Meteor.call('setSetting', template.data._id, 'times', times);
    },
    
    'click .set-time-del': function (event, template) {
        var times = template.data.settings.times;
        times.splice(times.indexOf(this), 1);
        Meteor.call('setSetting', template.data._id, 'times', times);
    },

    'click #set-delete': function (event, template) {
        template.$('#delete-confirm-modal').modal('show');
    },
    
    'click #set-delete-cancel': function (event, template) {
        template.$('#delete-confim-modal').modal('hide');
    },
    
    'click #set-delete-confirm': function (event, template) {
        template.$('#delete-confirm-modal').removeClass('fade').modal('hide');
        Meteor.call('setDelete', template.data._id);
        Router.go('/sets');
    }
});
