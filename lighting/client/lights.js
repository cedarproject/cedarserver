Template.lights.helpers({
    lights: function () {
        return lights.find();
    }
});

Template.lights.events({
    'click .light-add': function (event) {
        Meteor.call('lightNew');
    },
    
    'click .light-clone': function (event) {
        Meteor.call('lightClone', this._id);
    }
});
