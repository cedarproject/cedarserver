Template.songArrangement.helpers({
    getTitle: function (_id) {
        return songsections.findOne(_id).title;
    },
    
    sections: function () {
        return songsections.find({song: this.song});
    }
});

Template.songArrangement.events({
    'click .arrangement-title': function (event, template) {
        template.$('.arrangement-title').addClass('hidden');
        template.$('.arrangement-title-edit').removeClass('hidden');
    },
    
    'blur .arrangement-title-edit': function (event, template) {
        Meteor.call('songArrangementTitle', this._id, template.$('.arrangement-title-edit').val());
        template.$('.arrangement-title').addClass('hidden');
        template.$('.arrangement-title-edit').removeClass('hidden');
    },
    
    'click .order-add': function (event, template) {
        var order = template.data.order;
        order.push(this._id);
        Meteor.call('songArrangementOrder', template.data._id, order);
    },

    'click .order-down': function (event, template) {
        var order = template.data.order;
        var i = order.indexOf(this.toString());
        if (i < order.length-1) {
            order.splice(i+1, 0, order.splice(i, 1)[0]);
            Meteor.call('songArrangementOrder', template.data._id, order);
        }
    },

    'click .order-up': function (event, template) {
        var order = template.data.order;
        var i = order.indexOf(this.toString());
        if (i > 0) {
            order.splice(i-1, 0, order.splice(i, 1)[0]);
            Meteor.call('songArrangementOrder', template.data._id, order);
        }
    },
    
    'click .order-del': function (event, template) {
        var order = template.data.order;
        var i = order.indexOf(this.toString());
        order.splice(i, 1);
        Meteor.call('songArrangementOrder', template.data._id, order);
    },
    
    'click #arrangement-del': function (event, template) {
        Meteor.call('songDelArrangement', template.data._id);
    }
});
