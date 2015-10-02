Template.presentationsMenu.helpers({
    presentations: function () {
        return presentations.find();
    }
});

Template.presentationsMenu.events({
    'click #pres-add': function (event, template) {
        Meteor.call('presentationNew', function (err, pres) {
            if (!err) Router.go('/presentations/presentation/' + pres);
        });
    }
});
