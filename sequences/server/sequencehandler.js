SequenceHandler = class SequenceHandler {
    constructor (action) {
        this.action = action;
        this.sequence = sequences.findOne(action.sequence);
        
        this.time = parseFloat(this.action.time);
        this.loop = this.sequence.settings.loop;
        this.duration = parseFloat(this.sequence.settings.duration);
        
        this.useBPM = this.sequence.settings.useBPM;
        if (this.useBPM == 'yes') {
            this.bpm = parseFloat(this.sequence.settings.bpm);
            this.beat = 60.0 / this.bpm;
            this.duration *= this.beat;
        }
        
        this.actions = actions.find({sequenceid: this.sequence._id}).fetch();
        
        if (this.useBPM == 'yes') {
            this.actions.forEach((action) => {
                if (action.type == 'light' || action.type == 'lightgroup' || action.type == 'lightscene')
                    action.settings.lights_fade = parseFloat(combineSettings(action.settings).lights_fade) * this.beat;
                if (action.type == 'media' || action.type == 'mediaplaylist')
                    action.settings.media_fade = parseFloat(combineSettings(action.settings).media_fade) * this.beat;
            });
        }
        
        this.start();
    }

    start () {
        var b = Date.now()
        this.sequence_handlers = {};
        this.timers = [];
        
        this.actions.forEach((action) => {
            if (this.useBPM == 'yes') {
                var time = this.time + (action.settings.sequence_start * this.beat) - 0.1;
            } else {
                var time = this.time + action.settings.sequence_start - 0.1;
            }
            
            action.time = time;
            action.stage = this.sequence.stage;
            
            console.log(action.defaulttitle, action.time * 1000 - Date.now(), action.settings.lights_fade);
            
            this.timers.push(
                Meteor.setTimeout(
                    () => this.do(action),
                    time * 1000 - Date.now()
                )
            );
        });
        
        if (this.loop == 'yes') {            
            if (this.useBPM == 'yes') {
                this.time += this.duration;
                console.log('restart at', this.time * 1000 - Date.now());
                this.timers.push(Meteor.setTimeout(() => {this.stop(); this.start();}, this.time * 1000 - Date.now()));
            } else {
                this.time += this.duration;
                console.log('restart at', this.time, this.duration, this.time * 1000 - Date.now());
                this.timers.push(Meteor.setTimeout(() => {this.stop(); this.start();}, this.time * 1000 - Date.now()));
            }
        }
        console.log('start finished in', Date.now() - b)
    }
    
    do (action) {
        if (action.type == 'sequence') {
            this.sequence_handlers[action.settings.sequence_channel] = new SequenceHandler(action);
        }
        
        console.log('activating action', action.defaulttitle, action.time);
        action_activate(action);
    }
    
    stop () {
        for (var seq in this.sequence_handlers) {
            if (this.sequence_handlers.hasOwnProperty(seq)) seq.stop();
        }
        
        this.timers.forEach((timer) => {
            Meteor.clearTimeout(timer);
        });
    }
};
