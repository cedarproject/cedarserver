Template.setsMenu.helpers({
    setsSelector: {
        collection: sets,
        displayTemplate: 'setDisplay',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: false
    }
});

Template.setsMenu.events({
    'click .sets-new': function () {
         Meteor.call('setNew', function (err, val) {
            if (!err) Router.go('/set/' + val);
        });
    },
});
