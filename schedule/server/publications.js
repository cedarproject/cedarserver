Meteor.publish('schedules', function () {
    return schedules.find();
});
