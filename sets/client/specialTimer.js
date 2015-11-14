Template.specialTimer.helpers({
    typeIs: function (type) {
        return combineSettings(this.settings).timer_type == type;
    },
    
    getTime: function (type) {
        return `${this.settings.timer_time.hours}:${this.settings.timer_time.minutes}:${this.settings.timer_time.seconds}`;
    }
});
