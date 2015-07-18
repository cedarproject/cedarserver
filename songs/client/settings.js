Template.songSettings.helpers({
    sections: function () {
        return songsections.find({song: this._id});
    },
    
    arrangements: function () {
        return songarrangements.find({song: this._id});
    }
});

Template.songSettings.events({
    'click #title': function (event, template) {
        $('#title').addClass('hidden');
        $('#titleedit').removeClass('hidden');
    },
    
    'blur #titleedit': function (event, template) {
        Meteor.call('songTitle', this._id, $('#titleedit').val());
        $('#titleedit').addClass('hidden');
        $('#title').removeClass('hidden');
    },
    
    'click #section-add': function (event, template) {
        Meteor.call('songAddSection', this._id);
    },
    
    'click #arrangement-add': function (event, template) {
        Meteor.call('songAddArrangement', this._id);
    }
});
