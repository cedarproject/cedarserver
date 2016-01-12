time = {
    offsets: [],
    now: function () {return performance.now() + _.reduce(this.offsets, (m,n) => m+n) / this.offsets.length},
    since: function (t) {return this.now() - t},
    calc: function () {
        var start = performance.now();

        Meteor.call('getTime', (err, server_now) => {
            var now = performance.now();
            var latency = now - start;
            
            var offset = (server_now - latency / 2) - now;
                        
            if (this.offsets.length >= 1) this.offsets.shift();
            this.offsets.push(offset);
        })
    }
}

Meteor.startup(function () {
    time.calc.bind(time)();
    Meteor.setInterval(time.calc.bind(time), 100);
});

//test = {l: 0, l_t: 0, a: [], r: function () {var t = time.now(); var n = performance.now(); var d = (t - test.l) - (n - test.l_t); test.a.push(Math.abs(d)); console.log(`o:${d}, a:${_.reduce(test.a, (m,n) => m+n)/test.a.length}, m:${_.max(test.a)}`); test.l = t; test.l_t = n;}}; test.r(); test.a.pop(); Meteor.setInterval(test.r, 1000);
