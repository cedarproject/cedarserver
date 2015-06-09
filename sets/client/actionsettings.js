Template.actionSettings.helpers({
    triggers: function () {
        return actions.find({actionid: this._id});
    }
});

Template.actionSettings.events({
    'click .trigger-add': function (event, template) {
        template.$('.action-selector-modal').modal('show');
    },

    'click .trigger-del': function (event, template) {
        Meteor.call('actionRemove', this._id);
    },
    
    'click .collection-add': function (event, template) {
        var t = $(event.target);
    
        var action = {};
        action.actionid = template.data._id;
        
        if (t.data('collection') == 'media') {
            action.type = 'media';
            action.media = t.data('id');
            action.mediatype = media.findOne(action.media).type;
        }
        
        else if (t.data('collection') == 'lightscenes') {
            action.type = 'lightscene';
            action.lightscene = t.data('id');
        }

        Meteor.call('actionAdd', action);
    },
    
    'click .action-del': function (event, template) {
        Meteor.call('actionRemove', template.data._id);
        Router.go('/set/' + template.data.set);
    }
});
