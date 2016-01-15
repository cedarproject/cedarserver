Template.streamingMixes.helpers({
    mixesSelector: {
        collection: streamingmixes,
        displayTemplate: 'streamingMixDisplay',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: false
    }
});

Template.streamingMixes.events({
    'click #new-mix': function (event, template) {
        Meteor.call('streamingMixAdd', (err, res) => {
            if (!err) Router.go('/streaming/mix/' + res);
        });
    }
});
