SequenceHandler = class SequenceHandler {
    constructor (action) {
        this.action = action;
        this.sequence = sequences.findOne(action.sequence);
        
        this.time = this.action.time;
        this.loop = this.sequence.settings.loop;
        this.duration = this.sequence.settings.duration;
        
        this.useBPM = this.sequence.settings.useBPM;
        if (this.useBPM) {
            this.bpm = this.sequence.settings.bpm;
            this.beat = 60.0 / this.bpm;
            this.duration *= this.beat;
        }
        
        this.actions = actions.find({sequenceid: this.sequence._id}).fetch();
        
        if (this.useBPM) {                
            for (var p of ['lights_fade', 'media_fade']) {
                if (action.settings.hasOwnProperty(p)) action.settings[p] *= this.beat;
            }
        }
        
        this.start();
    }

    start () {
        this.sequence_handlers = {};
        this.timers = [];
        
        this.actions.forEach((action) => {
            if (this.useBPM) {
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
            if (this.useBPM) {
                console.log('restart at', (this.time + (this.duration * this.beat)) * 1000 - Date.now());
                this.time += this.duration * this.beat;
                this.timers.push(Meteor.setTimeout(() => {this.stop(); this.start();}, (this.time + (this.duration * this.beat)) * 1000 - Date.now()));
            } else {
                this.time += this.duration;
                this.timers.push(Meteor.setTimeout(() => {this.stop(); this.start();}, this.duration * 1000));
            }
        }
    }
    
    do (action) {
        if (action.type == 'sequence') {
            this.sequence_handlers[action.settings.sequence_channel] = new SequenceHandler(action);
        }
        
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
