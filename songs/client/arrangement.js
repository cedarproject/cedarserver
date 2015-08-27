Template.songArrangement.helpers({
    getOrder: function () {
        var out = [];
        for (var i in this.order) {
            out.push({
                title: songsections.findOne(this.order[i]).title,
                index: i
            });
        }

        return out;
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
        if (this.index < order.length-1) {
            order.splice(this.index+1, 0, order.splice(this.index, 1)[0]);
            Meteor.call('songArrangementOrder', template.data._id, order);
        }
    },

    'click .order-up': function (event, template) {
        var order = template.data.order;
        if (this.index > 0) {
            order.splice(this.index-1, 0, order.splice(this.index, 1)[0]);
            Meteor.call('songArrangementOrder', template.data._id, order);
        }
    },
    
    'click .order-del': function (event, template) {
        var order = template.data.order;
        order.splice(this.index, 1);
        Meteor.call('songArrangementOrder', template.data._id, order);
    },
    
    'click #arrangement-del': function (event, template) {
        Meteor.call('songDelArrangement', template.data._id);
    }
});
