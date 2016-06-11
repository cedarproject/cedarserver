Template.sequences.helpers({
    sequencesSelector: {
        collection: sequences,
        displayTemplate: 'sequenceDisplay',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: false
    }
});

Template.sequences.events({
    'click #sequence-new': function (event, template) {
        Meteor.call('sequenceNew', function (err, _id) {
            if (!err) Router.go(`/sequence/${_id}`);
        });
    }
});
