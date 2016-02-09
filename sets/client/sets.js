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
         Meteor.call('setNew', function (err, newid) {
            if (!err) Router.go(`/set/${newid}`);
        });
    },
    
    'click .set-copy': function () {
        Meteor.call('setCopy', this._id, function (err, newid) {
            if (!err) Router.go(`/set/${newid}`);
        });
    }
});
