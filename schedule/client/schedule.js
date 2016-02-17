Template.schedule.helpers({
    stageTitle: function (stageid) {
        var stage = stages.findOne({_id: stageid});
        if (stage) return stage.title;
        else return 'Unassigned';
    },
            
    stages: function () {
        return stages.find({_id: {$ne: this.stage}});
    },

    activeIsActive: function (state) {
        if (this.active == state) return 'active';
    },
    
    activeIsChecked: function (state) {
        if (this.active == state) return 'checked';
    },
    
    saveDisabled: function () {
        if (Session.get('saved')) return 'disabled';
    },
    
    getSchedules: function () {
        var schedules = Session.get('when').schedules;
        for (var s in schedules) schedules[s].index = s;
        return schedules;
    },
    
    getActions: function () {
        return actions.find({schedule: this._id});
    }
});

Template.schedule.onCreated(function () {
    Session.set('saved', true);
    Session.set('when', this.data.when);
});

Template.schedule.events({
    'blur #title': function (event, template) {
        var title = $(event.target).val().trim();
        if (title.length > 0)
            Meteor.call('scheduleTitle', template.data._id, title);
    },
    
    'change #stage': function (event, template) {
        Meteor.call('scheduleStage', template.data._id, $(event.target).val());
    },
    
    'change #schedule-active': function (event, template) {
        if (!this.active) Meteor.call('scheduleActive', template.data._id, true);
    },
    
    'change #schedule-disabled': function (event, template) {
        if (this.active) Meteor.call('scheduleActive', template.data._id, false);
    },
    
    'click #add-item': function (event, template) {
        Session.set('saved', false);
        
        var when = Session.get('when');
        when.schedules.push({h: [0], m: [0], s: [0]});        
        Session.set('when', when);
    },
    
    'click .remove-item': function (event, template) {
        Session.set('saved', false);
        
        var when = Session.get('when');
        when.schedules.splice(when.schedules.indexOf(this), 1);        
        Session.set('when', when);
    },
    
    'click #save': function (event, template) {
        Meteor.call('scheduleSet', template.data._id, Session.get('when'));
        Session.set('saved', true);
    },
    
    'click #add-action': function (event, template) {
        template.$('.action-selector-modal').modal('show');
    },
    
    'click .collection-add': function (event, template) {
        var col = $(event.target).data('collection');
        var _id = $(event.target).data('id');
        
        var action = create_action(col, _id);

        action.schedule = template.data._id;
        
        Meteor.call('actionAdd', action);

        template.$('.action-selector-modal').modal('hide');
    },
    
    'click .action-settings': function (event, template) {
        $(event.target).parent().next('.settings').collapse('toggle');
    },
    
    'click .action-remove': function (event, template) {
        Meteor.call('scheduleDelAction', this._id);
    }
});
