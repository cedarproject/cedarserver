Template.lights.helpers({
    lights: function () {
        return lights.find();
    },
    
    lightSelector: {
        collection: lights,
        displayTemplate: 'lightsListItem',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
        sort: [['title', 1]],
        addbutton: false
    },
});

Template.lights.events({
    'click .light-add': function (event) {
        Meteor.call('lightNew');
    },
    
    'click .light-clone': function (event) {
        Meteor.call('lightClone', this._id);
    }
});
