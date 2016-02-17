Template.schedules.helpers({
    schedulesSelector: {
        collection: schedules,
        displayTemplate: 'scheduleDisplay',
        fields: [{field: 'title', type: String}],
        sort: [['title', 'asc']],
        addbutton: false
    }
});

Template.schedules.events({
    'click #schedule-new': function (event, template) {
        Meteor.call('scheduleNew', function (err, _id) {
            if (!err) Router.go(`/schedule/${_id}`);
        });
    }
});
