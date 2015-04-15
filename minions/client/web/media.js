var render = function () {
    if (this.continue) {
        requestAnimationFrame(this.render.bind(this));
        
        for (i = this.fades.length-1; i >= 0; i--) {
            var fade = this.fades[i];
            if (!fade['curr']) fade.curr = fade.start;
            
            var currtime = window.performance.now();
            var elapsed = (currtime - fade.time) * 0.001;
            
            if (fade.curr < fade.end) {
                fade.curr = fade.end / (fade.length / elapsed);
                if (fade.curr > fade.end || isNaN(fade.curr)) fade.curr = fade.end;
            }
                
            else if (fade.curr > fade.end) {
                fade.curr = 1.0 / (fade.length / (fade.length - elapsed));
                if (fade.curr < fade.end || isNaN(fade.curr)) fade.curr = fade.end;
            }
            
            fade.callback(fade.curr);
            if (fade.curr == fade.end) this.fades.pop(i);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

var create_blocks = function (play) {
    var meshes = [];
    for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];
        
        var plane = new THREE.PlaneGeometry(this.media_width * block.width * block.scalex,
                                            this.media_height * block.height * block.scaley);
                
        var coords = [
            new THREE.Vector2(block.x, block.y + block.height),
            new THREE.Vector2(block.x, block.y),
            new THREE.Vector2(block.x + block.width, block.y),
            new THREE.Vector2(block.x + block.width, block.y + block.height)
        ];
        
        plane.faceVertexUvs[0][0] = [coords[0], coords[1], coords[3]];
        plane.faceVertexUvs[0][1] = [coords[1], coords[2], coords[3]];

        plane.applyMatrix(new THREE.Matrix4().set(
            1, block.skewx, 0, 0,
            block.skewy, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ));
                
        var mesh = new THREE.Mesh(plane, play.material);
        
        mesh.position.x = this.media_width * block.transx;
        mesh.position.y = this.media_height * block.transy;
        mesh.position.z = block.transz;

        mesh.rotation.x = block.rotx;
        mesh.rotation.y = block.roty;
        mesh.rotation.z = block.rotz;
                
        mesh.updateMatrix();
        
        meshes.push(mesh);
        this.scene.add(mesh);
    }
    return meshes;
}

var changed = function (id, fields) {
    var newsettings = fields['settings'];
    var actions = fields['actions'];
    
    if (newsettings) {
        if (newsettings['blocks']) {
            this.blocks = newsettings.blocks;
            for (var i = 0; i < this.playing.length; i++) {
                var play = this.playing[i];
                if (play.type == 'video' || play.type == 'image') {
                    for (var i = 0; i < play.meshes.length; i++) {
                        this.scene.remove(play.meshes[i]);
                    }
                    play.meshes = this.create_blocks(play);
                }
            }
        }
    }
    
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
                
                play.texture = new THREE.VideoTexture(play.video);
                play.texture.minFilter = THREE.LinearFilter;
                play.texture.magFilter = THREE.LinearFilter;

                play.material = new THREE.MeshLambertMaterial({map: play.texture, transparent: true, opacity: 0});
                
                play.meshes = this.create_blocks(play);
                                                
                this.fades.push({
                    start: 0, end: 1,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (m,v) {m.opacity = v}.bind(this, play.material)
                });

            }
            
            else if (m.type == 'image') {
                play.type = 'image';
                play.texture = THREE.ImageUtils.loadTexture(settings.findOne({key: 'mediaurl'}).value + m.location);
                play.texture.minFilter = THREE.LinearFilter;
                play.texture.magFilter = THREE.LinearFilter;

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

    if (actions) for (var i = this.playing.length - 1; i >= 0; i--) {
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
        if (play.type == 'video' || play.type == 'image') {
            for (var i = 0; i < play.meshes.length; i++) {
                this.scene.remove(play.meshes[i]);
            }
            play.meshes = this.create_blocks(play);            
        }
    }
}

Template.webminionmedia.onRendered(function () {
    $('body').addClass('no-scrollbars');
    this.render = render;
    this.create_blocks = create_blocks;
    
    this.playing = [];
    this.playing_ids = [];
    this.fades = [];
    this.blocks = [];

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
