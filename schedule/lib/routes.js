Router.route('/schedules', {name: 'schedules'});

Router.route('/schedule/:_id', {
    name: 'schedule',
    waitOn: function () {
        return [
            Meteor.subscribe('schedules'),
            Meteor.subscribe('actions')
        ];
    },
    data: function () {
        return schedules.findOne({_id: this.params._id});
    }
});
