Template.mediaSettings.helpers({
    typeIs: function () {
        for (var arg in arguments) {
            if (arguments[arg] == this.type) return true;
        }
    },
    
    mediaPath: function () {
        return settings.findOne({key: 'mediaurl'}).value + this.location;
    },
    
    getLength: function () {
        return secondsToTimeString(parseFloat(this.duration));
    }
});

Template.mediaSettings.onRendered(function () {
    if (this.data && this.data['new']) Meteor.call('mediaSetNew', this.data._id, false);
});

Template.mediaSettings.events({
    'blur .media-title': function (event, template) {
        var title = $(event.target).val();
        Meteor.call('mediaTitle', this._id, title);
    },
    
    'click .tag-add, keypress .tag-input': function (event, template) {
        if (event.type == 'keypress' && event.which != 13) return true;
    
        var tags = template.$('.tag-input').val().split(',');
        
        for (var i in tags) {
            tags[i] = tags[i].trim();
            if (tags[i].length == 0) tags.splice(i, 1);
        }
        
        Meteor.call('mediaAddTags', this._id, tags);
        template.$('.tag-input').val('');
    },
    
    'click .media-tag': function (event, template) {
        var tag = $(event.target).data('tag');
        Meteor.call('mediaDelTag', template.data._id, tag);
    },

    'click .media-del': function (event, template) {
        Meteor.call('mediaDel', this._id);
        Router.go('/media/items');
    }
});
