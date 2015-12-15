Template.presentationsMenu.helpers({
    presentationSelector: {
        collection: presentations,
        displayTemplate: 'presentationMenuItem',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: false
    },
});

Template.presentationsMenu.events({
    'click #pres-add': function (event, template) {
        Meteor.call('presentationNew', function (err, pres) {
            if (!err) Router.go('/presentations/presentation/' + pres);
        });
    }
});
