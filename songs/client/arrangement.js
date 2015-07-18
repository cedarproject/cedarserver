Template.songArrangement.helpers({
    getTitle: function (_id) {
        return songsections.findOne(_id).title;
    },
    
    sections: function () {
        return songsections.find({song: this.song});
    }
});

Template.songArrangement.events({
    'click .order-add': function (event, template) {
        Meteor.call('songArrangementAddSection', template.data._id, this._id);
    },
    
    'click #arrangement-del': function (event, template) {
        Meteor.call('songDelArrangement', template.data._id);
    }
});
