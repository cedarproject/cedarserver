function typeIs (type, item) {
    if (type == 'daily' && !item.hasOwnProperty('D') && !item.hasOwnProperty('d')) return true;
    else if (type == 'daysofweek' && item.hasOwnProperty('d')) return true;
    else if (type == 'daysofmonth' && item.hasOwnProperty('D')) return true;
}

Template.scheduleItem.helpers({
    typeIsSelected: function (type) {
        if (typeIs(type, this)) return 'selected';
    },
    
    typeIs: function (type) {
        return typeIs(type, this);
    },
    
    weekdayIsActive: function (day) {
        if (this.d.indexOf(day) != -1) return 'active';
    },
    
    getMonthDays: function () {
        return _.range(1, 32);
    },
    
    monthdayIsActive: function (day) {
        if (Template.parentData().D.indexOf(day) != -1) return 'active';
    }
});

Template.scheduleItem.onRendered(function () {
    this.$('.scheduleitem-time').datetimepicker({
        inline: true,
        format: 'h:mm:ss a',
        defaultDate: new moment(
            `${this.data.h[0]}:${this.data.m[0]}:${this.data.s[0]}`,
            'H:mm:ss Z'
        )
    }).on('dp.change', (event) => {
        Session.set('saved', false);
        
        var when = Session.get('when');
        
        when.schedules[this.data.index].h = [event.date.hour()];
        when.schedules[this.data.index].m = [event.date.minute()];
        when.schedules[this.data.index].s = [event.date.second()];
        
        Session.set('when', when);
    });
});

Template.scheduleItem.events({
    'change .scheduleitem-type': function (event, template) {
        Session.set('saved', false);
                
        var when = Session.get('when');
        
        console.log(when, template.data);
        
        delete when.schedules[template.data.index].d;
        delete when.schedules[template.data.index].D;
        
        if ($(event.target).val() == 'daysofweek') when.schedules[template.data.index].d = [];
        else if ($(event.target).val() == 'daysofmonth') when.schedules[template.data.index].D = [];
        
        Session.set('when', when);
    },
    
    'click .scheduleitem-weekday': function (event, template) {
        Session.set('saved', false);
        
        var when = Session.get('when');
        
        var day = parseInt($(event.target).data('day'));
        
        var dayindex = when.schedules[template.data.index].d.indexOf(day) 
        if (dayindex == -1) when.schedules[template.data.index].d.push(day);
        else when.schedules[template.data.index].d.splice(dayindex, 1);
        
        Session.set('when', when);
    },
    
    'click .scheduleitem-monthday': function (event, template) {
        Session.set('saved', false);
        
        var when = Session.get('when');
        
        var day = parseInt($(event.target).data('day'));
        
        var dayindex = when.schedules[template.data.index].D.indexOf(day) 
        if (dayindex == -1) when.schedules[template.data.index].D.push(day);
        else when.schedules[index].D.splice(dayindex, 1);
        
        Session.set('when', when);
    },
});
