time = {
    latency: 0,
    last: 0,
    last_time: 0,
    now: function () {return this.last + (performance.now() - this.last_time)},
    since: function (t) {return this.now() - t}
}

function calc_time () {
    var start = performance.now();
    Meteor.call('getTime', (err, server_now) => {
        var now = performance.now();
        time.latency = now - start;
        
        time.last = server_now - time.latency / 2;
        time.last_time = now;
    });
}

Meteor.startup(function () {
    calc_time();
    Meteor.setInterval(calc_time, 1000);
});
