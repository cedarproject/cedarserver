MediaMinionSong = class MediaMinionSong {
    constructor (action, minion) {
        this.canremove = true;
        this.removed = false;
        this.blank = false;
    
        this.action = action;
        this.settings = action.settings;
        this.args = action.args;
        
        this.minion = minion;

        this.z = this.minion.stage.settings.layers.indexOf(this.action.layer) * 0.001;
    
        this.type = 'song';
        this.song = songs.findOne(this.action.song);
        this.arrangement = songarrangements.findOne(this.settings.arrangement);

        if (typeof this.args.section === 'undefined') {
            this.blank = true;
            return;
        }

        this.section = songsections.findOne(this.arrangement.order[this.args.section]);
        this.contents = this.section.contents[this.args.index];

        this.text = [];
        for (var line of songTextToCanvas(this.contents.text).split('\n')) {
            line = line.trim();
            if (line.length > 0) this.text.push(line);
        }
        
        this.settings = combineSettings(this.settings, this.song.settings, this.minion.settings);
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.cx = this.canvas.getContext('2d');

        this.cx.font = `${this.settings.songs_font_weight} ${this.settings.songs_font_size}px ${this.settings.songs_font}`;
        this.cx.fillStyle = this.settings.songs_font_color;
        this.cx.strokeStyle = `${this.settings.songs_font_shadow}px ${this.settings.songs_font_shadow_color}`;
        
        this.cx.textAlign = this.settings.songs_text_align;
        if (this.settings.songs_text_align == 'left') var x = 0;
        else if (this.settings.songs_text_align == 'center') var x = window.innerWidth/2;
        else if (this.settings.songs_text_align == 'right') var x = window.innerWidth;
        
        if (this.settings.songs_text_vertical_align == 'top') {
            this.cx.textBaseline = 'top';
            var y = 0;
        } else if (this.settings.songs_text_vertical_align == 'center') {
            this.cx.textBaseline = 'middle';
            var y = window.innerHeight/2 - (this.settings.songs_font_size * this.text.length)/2;
        } else if (this.settings.songs_text_vertical_align == 'bottom') {
            this.cx.textBaseline = 'bottom';
            var y = window.innerHeight - this.settings.songs_font_size * this.text.length;
        }
        
        for (var l in this.text) {
            var line = this.text[l].trim();
            
            this.cx.fillText(line, x, y + (this.settings.songs_font_size * l), window.innerWidth);                    
            this.cx.strokeText(line, x, y + (this.settings.songs_font_size * l), window.innerWidth);
        }
        
        this.texture = new THREE.Texture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.needsUpdate = true;

        this.materials = [];
        this.meshes = [];
        this.opacity = 0;
    }
    
    show (old) {
        this.canremove = false;
        
        if (old) {
            old.hide();
            old.remove();
        }
         
        if (!this.blank) {       
            this.minion.create_blocks(this);            

            this.minion.fades.push({
                start: 0, end: 1,
                length: parseFloat(this.settings.songs_fade) * 1000,
                time: this.action.time,
                callback: (v) => {
                    this.opacity = v;
                    for (var n in this.materials) {
                        this.materials[n].uniforms.opacity.value = v;
                    }
                }
            });
        }
    }
    
    hide () {
        if (!this.blank) {
            this.minion.fades.push({
                start: 1, end: 0,
                length: parseFloat(this.settings.songs_fade) * 1000,
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
        } else this.canremove = true;
    }
    
    remove () {
        if (this.canremove) {
            $(this.canvas).remove();
            this.removed = true;
        }
        
        else Meteor.setTimeout(this.remove.bind(this), 100);
    }
}
