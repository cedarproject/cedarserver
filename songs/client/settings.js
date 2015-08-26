Template.songSettings.helpers({
    getKeys: function () {
        var keys = [];
        for (var p in key2num) if (key2num.hasOwnProperty(p)) keys.push(p);
        return keys;
    },
    
    keySelected: function (key) {
        if (Template.parentData().key == key) return 'selected';
    },

    sections: function () {
        return songsections.find({song: this._id});
    },
    
    arrangements: function () {
        return songarrangements.find({song: this._id});
    }
});

Template.songSettings.events({
    'click .song-title': function (event, template) {
        template.$('.song-title').addClass('hidden');
        template.$('.song-title-edit').removeClass('hidden');
    },
    
    'blur .song-title-edit': function (event, template) {
        Meteor.call('songTitle', this._id, template.$('.song-title-edit').val());
        template.$('.song-title-edit').addClass('hidden');
        template.$('.song-title').removeClass('hidden');
    },
    
    'change #song-key': function (event, template) {
        Meteor.call('songKey', template.data._id, $(event.target).val());
    },
    
    'click #section-add': function (event, template) {
        Meteor.call('songAddSection', this._id);
    },
    
    'click .section-del': function (event, template) {
        Meteor.call('songDelSection', this._id);
    },
    
    'click #arrangement-add': function (event, template) {
        Meteor.call('songAddArrangement', this._id);
    },
    
    'click .arrangement-del': function (event, template) {
        Meteor.call('songDelArrangement', this._id);
    }
});
