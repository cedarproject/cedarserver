MediaMinionMedia = class MediaMinionMedia {
    constructor (action, minion) {
        this.ready = false;
        this.shown = false;
        this.removed = false;
    
        this.action = action;
        this.minion = minion;
        
        this.media = media.findOne(this.action.media);
        this.settings = combineSettings(action.settings, this.media.settings, this.minion.settings);
                        
        if (this.media.type == 'video' || this.media.type == 'image') {                    
            this.materials = [];
            this.meshes = [];
            this.opacity = 0;
            
            this.z = this.minion.stage.settings.layers.indexOf(this.action.layer) * 0.001;

            if (this.media.type == 'video') {
                this.type = 'video';
                this.video = document.createElement('video');
                this.tosync = this.video;
                this.video.src = settings.findOne({key: 'mediaurl'}).value + this.media.location;
                this.video.controls = false;
                
                if (this.settings.media_loop == 'yes') {
                    this.video.addEventListener('ended', function () {
                        this.play();
                    }.bind(this.video));
                }
                
                this.video.onloadedmetadata = () => {                        
                    this.texture = new THREE.VideoTexture(this.video);
                    this.texture.minFilter = THREE.LinearFilter;
                    this.texture.magFilter = THREE.LinearFilter;
                    this.ready = true;
                }
            }
            
            else if (this.media.type == 'image') {
                this.type = 'image';
                
                this.image = new Image();
                this.image.src = settings.findOne({key: 'mediaurl'}).value + this.media.location;
                
                this.image.onload = () => {                        
                    this.texture = new THREE.Texture(this.image);
                    this.texture.minFilter = THREE.LinearFilter;
                    this.texture.magFilter = THREE.LinearFilter;
                    this.texture.needsUpdate = true;
                    this.ready = true;
                }
            }
        }
        
        else if (this.media.type == 'audio') {
            this.type = 'audio';
            this.audio = document.createElement('audio');
            this.tosync = this.audio;
            this.audio.src = settings.findOne({key: 'mediaurl'}).value + this.media.location;
            this.audio.controls = false;
            this.audio.volume = 0;

            if (this.settings.media_loop == 'yes') {
                this.audio.addEventListener('ended', function () {
                    this.play();
                }.bind(this.audio));
            }
            
            this.audio.onloadedmetadata = () => {
                this.ready = true;
            }
        }
    }
    
    sync () {
        if (this.settings.media_loop == 'yes')
            var t = time.since(this.action.time) % (this.tosync.duration * 1000);
        else var t = time.since(this.action.time);

        if (this.tosync.paused) {
            this.tosync.currentTime = t * 0.001;
            this.tosync.play();
        }
        
        else {
            var o = t * 0.001 - this.tosync.currentTime;

            if (o > 0.25) {
                this.tosync.currentTime = t * 0.001;
            } else {
                this.tosync.playbackRate = 1 + o;
            }
        }
        
        if (this.shown) Meteor.setTimeout(this.sync.bind(this), 500);
    }
    
    show (old) {
        if (this.ready) {
            this.shown = true;
            
            if (old) {
                old.hide();
                old.remove();
            }
            
            if (this.type == 'video' || this.type == 'audio') {
                this.sync();
            }

            if (this.type == 'video' || this.type == 'image') {
                this.minion.create_blocks(this);
                
                this.minion.fades.push({
                    start: 0, end: 1,
                    length: this.settings.media_fade * 1000,
                    time: this.action.time,
                    callback: (v) => {
                        this.opacity = v;
                        for (var n in this.materials) {
                            this.materials[n].uniforms.opacity.value = v;
                        }
                    }
                });
            }
            
            else if (this.type == 'audio') {
                this.minion.fades.push({
                    start: 0, end: 1,
                    length: this.settings.media_fade * 1000,
                    time: this.action.time,
                    callback: (v) => {this.audio.volume = v;}
                });
            }
        }
        
        else Meteor.setTimeout(this.show.bind(this, old), 100);
    }
    
    hide () {
        if (this.type == 'video' || this.type == 'image') {
            this.minion.fades.push({
                start: 1, end: 0,
                length: this.settings.media_fade * 1000,
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
        
        else if (this.type == 'audio') {
            this.minion.fades.push({
                start: 1, end: 0,
                length: this.settings.media_fade * 1000,
                time: time.now(),
                callback: (v) => {
                    this.audio.volume = v;
                    if (v == 0) this.shown = false;
                }
            });
        }
    }
    
    remove () {
        if (!this.shown) {
            if (this.type == 'video') {
                this.video.pause();
                $(this.video).remove();
            }
            
            if (this.type == 'audio') {
                this.audio.pause();
                $(this.audio).remove();
            }
            
            this.removed = true;
        }
        
        else Meteor.setTimeout(this.remove.bind(this), 100);
    }
}
