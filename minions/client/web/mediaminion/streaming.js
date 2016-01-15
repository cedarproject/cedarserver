MediaMinionStreaming = class MediaMinionStreaming {
    constructor (action, minion) {
        this.type = 'streaming';
        this.ready = false;
        this.shown = false;
        this.removed = false;
        
        this.action = action;
        this.minion = minion;
        
        this.type = this.action.streamingtype;
        if (this.type == 'source') {
            this.source = streamingsources.findOne(this.action.source);
            this._id = this.source._id;
        } else if (this.type == 'mix') {
            this.mix = streamingmixes.findOne(this.action.mix);
            this._id = this.mix._id;
        }
        
        this.settings = combineSettings(this.action.settings, this.minion.settings);
        
        this.volume = parseFloat(this.settings.media_volume) * parseFloat(this.settings.mediaminion_volume);

        this.materials = [];
        this.meshes = [];
        this.opacity = 0;
        
        this.z = this.minion.stage.settings.layers.indexOf(this.action.layer) * 0.001;

        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.video.controls = false;
        this.video.volume = 0;
        
        receiveStream(this.type, this._id, this.video);
        
        this.video.onloadedmetadata = () => {
            console.log(this.video, this.video.videoWidth, this.video.videoHeight);
            this.texture = new THREE.VideoTexture(this.video);
            this.texture.minFilter = THREE.LinearFilter;
            this.texture.magFilter = THREE.LinearFilter;
            this.texture.needsUpdate = true;
            this.ready = true;
        };
    }
    
    show (old) {
        if (this.ready) {
            if (old) {
                old.hide();
                old.remove();
            }
                
            this.minion.create_blocks(this);
            
            this.minion.fades.push({
                start: 0, end: 1,
                length: parseFloat(this.settings.media_fade) * 1000,
                time: this.action.time,
                callback: (v) => {
                    this.opacity = v;
                    for (var n in this.materials) {
                        this.materials[n].uniforms.opacity.value = v;
                    }
                    
                    this.video.volume = v * this.volume;
                }
            });
            
            this.shown = true;
        }
        
        else Meteor.setTimeout(this.show.bind(this, old), 100);
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
                
                this.video.volume = v * this.volume;

                if (v == 0) {
                    this.shown = false;
                    this.video.pause();
                    for (var i in this.meshes) {
                        this.minion.scene.remove(this.meshes[i]);
                    }
                }
            }
        });
    }
    
    remove () {
        if (!this.shown) {
            $(this.video).remove();
            this.removed = true;
        }
        
        else Meteor.setTimeout(this.remove.bind(this), 500);
    }
};
