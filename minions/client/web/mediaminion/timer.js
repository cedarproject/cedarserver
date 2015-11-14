MediaMinionTimer = class MediaMinionTimer {
    constructor (action, minion) {
        this.action = action;
        this.minion = minion;
        
        this.settings = combineSettings(action.settings, minion.settings);
        
        this.set = sets.findOne(action.set);
        
        this.shown = false;
        this.removed = false;
        
        this.last = 0;
        
        var t = this.settings.timer_time;
        
        if (this.settings.timer_type == 'countdown') {
            this.target = action.time + (t.hours * 3600000) + (t.minutes * 60000) + (t.seconds * 1000);
        }
        // TODO add startAt and endAt timers!
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.cx = this.canvas.getContext('2d');

        // TODO make all this settings, hard-coding for now due to time contraints
        this.cx.font = '32px sans-serif';
        this.cx.fillStyle = '#ffffff';
        this.cx.textBaseline = 'bottom';
        
        
        this.texture = null;
        this.materials = [];
        this.meshes = [];
        this.opacity = 1;
    }
    
    update () {
        // TODO make all this settings, hard-coding for now due to time contraints
        var i = 0;
        
        if (this.shown && time.since(this.last) > 1000) {
            this.last = time.now();
            
            this.cx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            
            var t = (this.target - this.last) * 0.001;
            var sign = '';
            
            if (t < 0) {
                sign = '-';
                t = Math.abs(t);
            }
            
            // And the award for 'worst abuse of template strings' goes to...
            var hours = `0${Math.floor(t / 3600)}`.slice(-2);
            var minutes = `0${Math.floor((t - hours * 3600) / 60)}`.slice(-2);
            var seconds = `0${Math.floor(t % 60)}`.slice(-2);
            
            var text = `${sign}${hours}:${minutes}:${seconds}`;
            
            this.cx.fillText(text, 10, window.innerHeight - 32);
            if (this.texture) this.texture.needsUpdate = true;
        }
        
        if (this.shown) Meteor.setTimeout(this.update.bind(this), 100);
    }
            

    show (old) {
        if (old) {
            old.hide();
            old.remove();
        }
        
        this.shown = true;
        this.update();

        this.texture = new THREE.Texture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.needsUpdate = true;
        
        this.minion.create_blocks(this);
    }
    
    hide () {
        this.shown = false;

        for (var i in this.meshes) {
            this.minion.scene.remove(this.meshes[i]);
        }        
    }

    remove () {
        $(this.canvas).remove();
        this.removed = true;
    }
}
