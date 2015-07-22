Template.lightGroups.helpers({
    groupSelector: {
        collection: lightgroups,
        displayTemplate: 'lightgroupsListItem',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
        sort: [['title', 1]],
        addbutton: false
    },
    
    lightgroups: function () {
        return lightgroups.find();
    }
});

Template.lightGroups.events({
    'click .group-add': function (event) {
        Meteor.call('lightGroupNew');
    }
});
