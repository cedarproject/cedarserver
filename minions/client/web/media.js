var render = function () {
    if (this.continue) {
        requestAnimationFrame(this.render.bind(this));
        
        for (i = this.fades.length-1; i >= 0; i--) {
            var fade = this.fades[i];
            if (!fade['curr']) fade.curr = fade.start;
            
            var currtime = window.performance.now();
            var elapsed = (currtime - fade.time) * 0.001;
            
            console.log(elapsed);

            if (fade.curr < fade.end) {
                fade.curr = fade.end / (fade.length / elapsed);
                if (fade.curr > fade.end || isNaN(fade.curr)) fade.curr = fade.end;
            }
                
            else if (fade.curr > fade.end) {
                fade.curr = 1.0 / (fade.length / (fade.length - elapsed));
                if (fade.curr < fade.end || isNaN(fade.curr)) fade.curr = fade.end;
            }
            
            console.log(fade.curr);
            fade.callback(fade.curr);
            if (fade.curr == fade.end) this.fades.pop(i);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
} 

var changed = function (id, fields) {
    var actions = fields['actions'];
    
    var activeactions = [];
    if (actions) for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        activeactions.push(action._id);

        if (this.playing_ids.indexOf(action._id) > -1) continue;
        this.playing_ids.push(action._id);

        var play = {_id: action._id, options: action.options};

        if (action.type == 'media') {
            var m = media.findOne(action.media);
            
            if (m.type == 'video') {
                play.type = 'video';
                play.video = document.createElement('video');
                play.video.src = settings.findOne({key: 'mediaurl'}).value + m.location;
                play.video.loop = true;
                play.video.controls = false;
                play.video.autoplay = true;
                
                play.video.addEventListener('loadedmetadata', function (play) {
                    play.texture = new THREE.VideoTexture(play.video);
                    play.texture.minFilter = THREE.LinearFilter;
                    play.texture.magFilter = THREE.LinearFilter;
                    play.texture.format = THREE.RGBFormat;
                    
                    play.plane = new THREE.PlaneGeometry(this.media_width, this.media_height);
                    play.material = new THREE.MeshLambertMaterial({map: play.texture, transparent: true, opacity: 0});
                    play.mesh = new THREE.Mesh(play.plane, play.material);
                    
                    this.scene.add(play.mesh);
                    this.fades.push({
                        start: 0, end: 1,
                        length: play.options['fade'] || 1,
                        time: window.performance.now(),
                        callback: function (m,v) {console.log(m, v); m.opacity = v}.bind(this, play.material)
                    });

                }.bind(this, play));
            }
            
            else if (m.type == 'image') {
                play.type = 'image';
                play.texture = THREE.ImageUtils.loadTexture(settings.findOne({key: 'mediaurl'}).value + m.location);
                play.material = new THREE.MeshLambertMaterial({map: play.texture, transparent: true, opacity: 0});
                play.plane = new THREE.PlaneGeometry(this.media_width, this.media_height);
                play.mesh = new THREE.Mesh(play.plane, play.material);
                this.scene.add(play.mesh);
                this.fades.push({
                    start: 0, end: 1,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (m, v) {m.opacity = v}.bind(this, play.material)
                });
            }
            
            else if (m.type == 'audio') {
                play.type = 'audio';
                play.audio = document.createElement('audio');
                play.audio.src = settings.findOne({key: 'mediaurl'}).value + m.location;
                play.audio.loop = true;
                play.audio.controls = false;
                play.audio.autoplay = true;
                play.audio.volume = 0;
                this.fades.push({
                    start: 0, end: 1,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (m, v) {m.volume = v}.bind(this, play.audio)
                });
            }                
        }

        this.playing.push(play);
    }

    for (var i = this.playing.length - 1; i >= 0; i--) {
        var play = this.playing[i];

        if (activeactions.indexOf(play._id) == -1) {
            if (play.type == 'video') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (play,v) {
                        play.material.opacity = v;
                        if (v == 0) {
                            this.scene.remove(play.mesh);
                            play.video.pause();
                        }
                    }.bind(this, play)
                });
            }
            
            else if (play.type == 'image') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (play,v) {
                        play.material.opacity = v;
                        if (v == 0) {
                            this.scene.remove(play.mesh);
                        }
                    }.bind(this, play)
                });
            }
            
            else if (play.type == 'audio') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (play,v) {
                        play.audio.volume = v;
                        if (v == 0) {
                            play.audio.pause();
                        }
                    }.bind(this, play)
                });
            }

            this.playing.pop(i);
            this.playing_ids.pop(i);
        }
    }
}

var resize = function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.media_height = 2 * Math.tan((this.camera.fov * Math.PI / 180) / 2);
    this.media_width = this.media_height * this.camera.aspect;
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    for (var i = 0; i < this.playing.length; i++) {
        var play = this.playing[i];
        if (play['plane']) {
            play.plane.dynamic = true;
            play.plane.width = this.media_width;
            play.plane.height = this.media_height;
            play.plane.verticesNeedUpdate = true;
        }
    }
}

Template.webminionmedia.onRendered(function () {
    $('body').addClass('no-scrollbars');
    this.render = render;
    
    this.playing = [];
    this.playing_ids = [];
    this.fades = [];

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 1;

    this.media_height = 2 * Math.tan((this.camera.fov * Math.PI / 180) / 2);
    this.media_width = this.media_height * this.camera.aspect;
    
    window.addEventListener('resize', resize.bind(this))

    this.light = new THREE.DirectionalLight(0xFFFFFF);
    this.light.position.set( 0.5, 1, 1 ).normalize();
    this.scene.add(this.light);
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    $('.media-container').append(this.renderer.domElement);

    this.continue = true;    
    this.render();
    
    minions.find(this.data).observeChanges({
        added: changed.bind(this),
        changed: changed.bind(this)
    });
});

Template.webminionmedia.onDestroyed(function () {
    $('body').removeClass('no-scrollbars');
    this.continue = false;
});
