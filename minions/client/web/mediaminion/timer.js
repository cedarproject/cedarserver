MediaMinionTimer = class MediaMinionTimer {
    constructor (action, minion) {
        this.type = 'timer';
    
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

        this.cx.font = `${this.settings.timers_font_weight} ${this.settings.timers_font_size}px ${this.settings.timers_font}`;
        this.cx.fillStyle = this.settings.timers_font_color;
        this.cx.strokeStyle = `{this.settings.timers_font_shadow}px ${this.settings.timers_font_shadow_color}`;
        
        this.cx.textAlign = this.settings.timers_text_align;
        if (this.settings.timers_text_align == 'left') this.x = 0;
        else if (this.settings.timers_text_align == 'center') this.x = window.innerWidth/2;
        else if (this.settings.timers_text_align == 'right') this.x = window.innerWidth;
        
        if (this.settings.timers_text_vertical_align == 'top') {
            this.cx.textBaseline = 'top';
            this.y = 0;
        } else if (this.settings.timers_text_vertical_align == 'center') {
            this.cx.textBaseline = 'middle';
            this.y = window.innerHeight / 2 - this.settings.timers_font_size / 2;
        } else if (this.settings.timers_text_vertical_align == 'bottom') {
            this.cx.textBaseline = 'bottom';
            this.y = window.innerHeight - this.settings.timers_font_size;
        }
        
        this.texture = null;
        this.materials = [];
        this.meshes = [];
        this.opacity = 0;
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
            
            this.cx.fillText(text, this.x, this.y);
            this.cx.strokeText(text, this.x, this.y);
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
        
        this.minion.fades.push({
            start: 0, end: 1,
            length: parseFloat(this.settings.timers_fade) * 1000,
            time: this.action.time,
            callback: (v) => {
                this.opacity = v;
                for (var n in this.materials) {
                    this.materials[n].uniforms.opacity.value = v;
                }
            }
        });
    }
    
    hide () {
        this.shown = false;

        this.minion.fades.push({
            start: 1, end: 0,
            length: parseFloat(this.settings.timers_fade) * 1000,
            time: time.now(),
            callback: (v) => {
                for (var n in this.materials) {
                    this.opacity = v;
                    this.materials[n].uniforms.opacity.value = v;
                }
                
                if (v == 0) {
                    for (var i in this.meshes) {
                        this.minion.scene.remove(this.meshes[i]);
                    }
                    
                    this.canremove = true;
                }
            }
        });    
    }

    remove () {
        $(this.canvas).remove();
        this.removed = true;
    }
}
