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

/* Still needs more work
Template.set.onRendered(function () {
    $(window).keypress(function (event, setid) {
        var set = sets.findOne(setid);
        if (this.active) {
            var action = actions.findOne(this.active);
            var num = actions.findOne({}, {sort: {order: -1}}).order;

            if (event.key == 'ArrowRight' && action.order < num) {
                if (action.type == 'song') {
                    var args = action.args;
                    var arrangement = songarrangements.findOne(action.settings.arrangement);
                    
                    if (!args['section'] || !args['index'] || !args['number']) {
                        args = {section: arrangement.order[0], index: 0, number: 0};
                        Meteor.call('actionArgs', action._id, args);
                        return;
                    }
                        
                    else {
                        var section = songsections.findOne(args.section);
                        if (section.length < args.index + 1) {
                            var i = arrangement.order.indexOf(args.section)
                            if (arrangement.order.length > i + 1) {
                                args = {section: arrangement.order[i + 1], index: 0, number: args.number + 1};
                                Meteor.call('actionArgs', action._id, args);
                                return;
                            }
                        }
                        
                        else {
                            args = {section: args.section, index: args.index + 1, number: args.number + 1};
                            Meteor.call('actionArgs', action._id, args);
                            return;
                        }
                    }
                }
                
                Meteor.call('setActivate', this._id, actions.findOne({set: this._id, order: action.order + 1})._id);
            }
        }
    }.bind(this, Template.currentData()._id));
}); */

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
            number: this.number
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
            settings: {}
        };
                
        var col = $(event.target).data('collection');
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
            action.settings.key = songs.findOne(action.song).key;
            action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
        }
        
        else if (col == 'presentations') {
            action.type = 'presentation';
            action.presentation = $(event.target).data('id');
            action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
        }
        
        else if (col == 'special') {
            var special = $(event.target).data('id');
            
            if (special == 'clear-layer') {
                action.type = 'clear-layer';
                action.layer = 'foreground'; // TODO fix this to default to the topmost layer, or something.
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
