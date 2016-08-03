Template.set.helpers({
    stageTitle: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) return stage.title;
        else return 'Unassigned';
    },
    
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
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

Template.set.onCreated(function () {
    Session.set('set-control-locked', false);
});

Template.set.events({
    'keydown input': function (event, template) {
        // Prevent shortcut keys from triggering when in an inputbox.
        event.stopImmediatePropagation();
    },

    'click .action-nav': function (event, template) {
        scrollTo(event.target.hash);
        event.preventDefault();
    },

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
        if (Session.get('set-control-locked')) return;
    
        if ($(event.target).hasClass('btn')) return;
        var set = Template.parentData();
        if (this._id != set.active) {
            Meteor.call('actionArgs', this._id, {});
            Meteor.call('setActivate', set._id, this._id);
        };
    },
    
    'click .song-content': function (event, template) {
        event.stopImmediatePropagation();
        if (Session.get('set-control-locked')) return;

        var args = {
            section: this.section,
            index: this.index,
        };
        
        Meteor.call('actionArgs', this.action, args);
        Meteor.call('setActivate', template.data._id, this.action);
    },
    
    'click .presentationslideselector .presentation-content': function (event, template) {
        // This whole system is ugly. Very ugly. TODO rewrite the whole thing using ES2015 classes for each action type! Ugly hack for now due to deadline.
        var action = create_action('presentationslide', this._id);

        var add_to = Session.get('add-to');
        
        if (add_to.type == 'set') {
            var a = actions.findOne({set: template.data._id}, {sort: {order: -1}, fields: {order: 1}});
            if (a) action.order = a.order + 1;
            else action.order = 0;

            action.set = template.data._id;
        } else if (add_to.type == 'replace') {
            Meteor.call('actionReplace', add_to.action, action);
        } else {
            action.actionid = add_to.action;
        }
        
        Meteor.call('actionAdd', action);
                    
        template.$('#presentation-slideselector-modal').modal('hide');
        return false;
    },
        
    'click .presentation-content': function (event, template) {
        event.stopImmediatePropagation();
        if (Session.get('set-control-locked')) return;
        
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
        if (Session.get('set-control-locked')) return;
        
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
    
    'click .collection-alt': function (event, template) {
        var col = $(event.target).data('collection');
        var _id = $(event.target).data('id');
        
        if (col == 'presentations') {
            Session.set('presentationSlideSelectorPresentation', _id);
            template.$('#presentation-slideselector-modal').modal('show');
        }
        
        $(event.target).parents('.modal').modal('hide');
    },
    
    'click .collection-add': function (event, template) {                
        var col = $(event.target).data('collection');
        var _id = $(event.target).data('id');
        
        var action = create_action(col, _id);

        var add_to = Session.get('add-to');
        
        if (add_to.type == 'set') {
            var a = actions.findOne({set: template.data._id}, {sort: {order: -1}, fields: {order: 1}});
            if (a) action.order = a.order + 1;
            else action.order = 0;

            action.set = template.data._id;
        } else if (add_to.type == 'replace') {
            Meteor.call('actionReplace', add_to.action, action);
        } else {
            action.actionid = add_to.action;
        }
        
        Meteor.call('actionAdd', action);
                    
        $(event.target).parents('.modal').modal('hide');
        return false;
    },

    'click .set-clear-layer': function (event, template) {
        if (Session.get('set-control-locked')) return;
        Meteor.call('setClearLayer', template.data._id, $(event.target).data('layer'));
    },

    'click .set-deactivate': function (event) {
        if (Session.get('set-control-locked')) return;
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
    
    'click #presentation-slideselector-cancel': function (event, template) {
        template.$('#presentation-slideselector-modal').modal('hide');
    },
    
    'click #set-delete-cancel': function (event, template) {
        template.$('#delete-confim-modal').modal('hide');
    },
    
    'click #set-delete-confirm': function (event, template) {
        template.$('#delete-confirm-modal').removeClass('fade').modal('hide');
        Meteor.call('setDelete', template.data._id);
        Router.go('/sets');
    },
});
