MediaMinionStreamingMix = class MediaMinionStreamingMix {
    constructor (action, minion) {
        this.type = 'streamingmix';
        this.shown = false;
        this.removed = false;
        
        this.action = action;
        this.minion = minion;
        
        this.mix = streamingmixes.findOne(this.action.mix);
        
        this.settings = combineSettings(this.mix.settings);
        
        this.volume = parseFloat(this.settings.media_volume) * parseFloat(this.settings.mediaminion_volume);

        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        var ratio = Math.min(window.innerWidth / this.settings.streamingmix_aspect_width, 
                             window.innerHeight / this.settings.streamingmix_aspect_height);
         
        this.width = this.settings.streamingmix_aspect_width * ratio;
        this.height = this.settings.streamingmix_aspect_height * ratio;
        
        this.vborder = Math.round((window.innerHeight - this.height) / 2);
        this.hborder = Math.round((window.innerWidth - this.width) / 2);

        this.cx = this.canvas.getContext('2d');
        
        this.texture = new THREE.Texture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        this.materials = [];
        this.meshes = [];
        this.opacity = 0;
        
        this.blank = false;
        
        this.sources = [];
        this.videomix = [];
        this.audiomix = [];
        
        streamingmixes.find(this.mix._id).observeChanges({
            changed: this.update
        });
        
        this.z = this.minion.stage.settings.layers.indexOf(this.action.layer) * 0.001;
        
        this.update(this.mix);        
    }
    
    update (mix) {
        if (mix.videomix != this.videomix) {
            this.blank = true;
            this.videomix = mix.videomix;
        }
        
        if (mix.audiomix != this.audiomix)
            this.audiomix = mix.audiomix;
        
        for (sourceid of mix.sources) {
            if (this.sources[sourceid]) continue;

            video = document.createElement('video');
            this.sources[sourceid] = video;
            
            video.autoplay = true;
            video.controls = false;
            video.volume = 0;
            
            receiveStream(sourceid, video);
        }
    }
    
    w2p (width) { // Float width to canvas coordinate
        return Math.round(this.width * width)
    }
    
    h2p (height) { // Float hieght to canvas coordiate
        return Math.round(this.height * height)
    }
    
    vw2p (width, video) { // Float width to video coordinate
        return Math.round(video.videoWidth * width);
    }
    
    vh2p (height, video) { // Float hieght to video coordiate
        return Math.round(video.videoHeight * height);
    }
      
    frame () {
        if (this.shown) {
            requestAnimationFrame(this.frame.bind(this));
            
            if (this.blank) {
                this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.blank = false;
            }
            
            for (v of this.videomix) {
                var video = this.sources[v.source];
                this.cx.drawImage(
                    video,
                    this.vw2p(v.sx, video), this.vh2p(v.sy, video),
                    this.vw2p(v.sw, video), this.vh2p(v.sh, video),
                    this.w2p(v.dx) + this.hborder, this.h2p(v.dy) + this.vborder,
                    this.w2p(v.dw) - this.hborder, this.h2p(v.dh) - this.vborder
                );
            }
            
            for (a of this.audiomix) {
                var audio = this.sources[v.source];
                audio.volume = a.volume * this.volume;
            }
            
            this.texture.needsUpdate = true;
        }
    }
    
    show (old) {
        if (old) {
            old.hide();
            old.remove();
        }
            
        this.minion.create_blocks(this);
        
        requestAnimationFrame(this.frame.bind(this));
        
        this.minion.fades.push({
            start: 0, end: 1,
            length: parseFloat(this.settings.media_fade) * 1000,
            time: this.action.time,
            callback: (v) => {
                this.opacity = v;
                for (var n in this.materials) {
                    this.materials[n].uniforms.opacity.value = v;
                }                    
            }
        });
        
        this.shown = true;
    }
    
    hide () {
        this.minion.fades.push({
            start: 1, end: 0,
            length: parseFloat(this.settings.media_fade) * 1000,
            time: time.now(),
            callback: (v) => {
                for (var n in this.materials) {
                    this.opacity = v;
                    this.materials[n].uniforms.opacity.value = v;
                }
                
                if (v == 0) {
                    this.shown = false;
                    
                    for (var i in this.meshes) {
                        this.minion.scene.remove(this.meshes[i]);
                    }
                }
            }
        });
    }
    
    remove () {
        if (!this.shown) {
            this.removed = true;
        }
        
        else Meteor.setTimeout(this.remove.bind(this), 500);
    }
};
