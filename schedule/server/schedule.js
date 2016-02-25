schedule_handles = {};

function schedule_callback (scheduleid) {
    var schedule = schedules.findOne(scheduleid);
    var time = Date.now() + 100;

    actions.find({schedule: schedule._id}).forEach((action) => {
        action.time = time;
        action_activate(action);
    });
}

function schedule_register (schedule) {
    if (schedule_handles[schedule._id]) {
        schedule_handles[schedule._id].clear();
        delete schedule_handles[schedule._id];
    }
    
    if (schedule.active && schedule.when.schedules.length > 0) {
        schedule_handles[schedule._id] = later.setInterval(
            Meteor.bindEnvironment(schedule_callback.bind(this, schedule._id)),
            schedule.when
        );
    }
}

Meteor.startup(function () {
    later.date.localTime();

    schedules.find().forEach((schedule) => {
        schedule_register(schedule);
    });
});

Meteor.methods({
    scheduleNew: function () {
        return schedules.insert({
            title: 'New Schedule',
            active: true,
            stage: null,
            when: {schedules: []},
            settings: {}
        });
    },
    
    scheduleDel: function (scheduleid) {        
        actions.remove({schedule: scheduleid});
        schedules.remove(scheduleid);
        
        if (schedule_handles[scheduleid]) {
            schedule_handles[scheduleid].clear();
            delete schedule_handles[scheduleid];
        }
    },
    
    scheduleTitle: function (scheduleid, title) {
        schedules.update(scheduleid, {$set: {title: title}});
    },
    
    scheduleStage: function (scheduleid, stageid) {
        schedules.update(scheduleid, {$set: {stage: stageid}});
    },
    
    scheduleActive: function (scheduleid, active) {
        schedules.update(scheduleid, {$set: {active: active}});

        var schedule = schedules.findOne(scheduleid);        
        schedule_register(schedule);
    },
    
    scheduleSet: function (scheduleid, when) {
        schedules.update(scheduleid, {$set: {when: when}});

        var schedule = schedules.findOne(scheduleid);        
        schedule_register(schedule);
    },
    
    scheduleAddAction: function (action) {
        actions.insert(action);
    },
    
    scheduleDelAction: function (actionid) {
        actions.remove(actionid);
    }
});
