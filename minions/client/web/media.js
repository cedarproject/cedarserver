var vertShaderSource = [
    'uniform mat4 uTransformMatrix;',
    'varying vec2 vUv;',
    'void main(void) {',
    '    vUv = uv;',
    '    gl_Position = uTransformMatrix * vec4( position, 1.0 );',
    '}'
].join('\n');

var fragShaderSource = [
    'varying vec2 vUv;',
    'uniform sampler2D uSampler;',
    'uniform float opacity;',
    'void main(void)  {',
    '    gl_FragColor = texture2D(uSampler, vUv);',
    '    gl_FragColor.a = opacity;',
    '}'
].join('\n');

    
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
    for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];
        
        var plane = new THREE.PlaneGeometry(block.width * this.media_width, block.height * this.media_height);
        
        var before = plane.vertices;
        
        var after = [];
        for (var n in block.points) {
            after.push(new THREE.Vector2(block.points[n][0], block.points[n][1]));
        }
        
        var b = numeric.transpose([[
            after[0].x, after[0].y,
            after[1].x, after[1].y,
            after[2].x, after[2].y,
            after[3].x, after[3].y ]]);
        
        var A = [];
        for(var n=0; n<before.length; n++) {
            A.push([
                before[n].x, 0, -after[n].x*before[n].x,
                before[n].y, 0, -after[n].x*before[n].y, 1, 0]);
            A.push([
                0, before[n].x, -after[n].y*before[n].x,
                0, before[n].y, -after[n].y*before[n].y, 0, 1]);
        }
        
        var m = numeric.transpose(numeric.dot(numeric.inv(A), b))[0];
        var matrix = new THREE.Matrix4().set(
            m[0], m[3],   0, m[6],
            m[1], m[4],   0, m[7],
               0,    0,   1,    0,
            m[2], m[5],   0,    1
        );

        var material = new THREE.ShaderMaterial({
            vertexShader: vertShaderSource,
            fragmentShader: fragShaderSource,
            transparent: true,  
            uniforms: {
                opacity: {type: 'f', value: play.opacity},
                uTransformMatrix: {type: 'm4', value: matrix},
                uSampler: {type: 't', value: play.texture}
            }
        });

        var uvs = [
            new THREE.Vector2(block.x, block.y + block.height),
            new THREE.Vector2(block.x + block.width, block.y + block.height),
            new THREE.Vector2(block.x, block.y),
            new THREE.Vector2(block.x + block.width, block.y),
        ];
        
        plane.faceVertexUvs[0][0] = [uvs[0], uvs[2], uvs[1]];
        plane.faceVertexUvs[0][1] = [uvs[2], uvs[3], uvs[1]];
                
        var mesh = new THREE.Mesh(plane, material);
        
        play.materials.push(material);
        play.meshes.push(mesh);
        this.scene.add(mesh);
    }
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
                    this.create_blocks(play);
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
            
            if (m.type == 'video' || m.type == 'image') {
                if (m.type == 'video') {
                    play.type = 'video';
                    play.video = document.createElement('video');
                    play.video.src = settings.findOne({key: 'mediaurl'}).value + m.location;
                    play.video.controls = false;
                    play.video.autoplay = true;
                    play.video.loop = true;
                    
                    play.video.addEventListener('ended', function (video) {
                        video.play();
                    }.bind(this, play.video));
                    
                    play.texture = new THREE.VideoTexture(play.video);
                    play.texture.minFilter = THREE.LinearFilter;
                    play.texture.magFilter = THREE.LinearFilter;
                }
                
                else if (m.type == 'image') {
                    play.type = 'image';
                    play.texture = THREE.ImageUtils.loadTexture(settings.findOne({key: 'mediaurl'}).value + m.location);
                    play.texture.minFilter = THREE.LinearFilter;
                    play.texture.magFilter = THREE.LinearFilter;
                }
                
                play.materials = [];
                play.meshes = [];
                play.opacity = 0; //TODO this whole mess is ugly, fix it! 

                this.create_blocks(play);
                                                
                this.fades.push({
                    start: 0, end: 1,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (m,v) {
                        for (var n in play.materials) {
                            play.opacity = v;
                            play.materials[n].uniforms.opacity.value = v;
                        }
                    }.bind(this, play.material)
                });
            }
            
            else if (m.type == 'audio') {
                play.type = 'audio';
                play.audio = document.createElement('audio');
                play.audio.src = settings.findOne({key: 'mediaurl'}).value + m.location;
                play.audio.controls = false;
                play.audio.autoplay = true;
                play.audio.loop = true;
                play.audio.volume = 0;

                play.audio.addEventListener('ended', function (audio) {
                    audio.play();
                }.bind(this, play.audio));

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
            if (play.type == 'video' || play.type == 'image') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (play,v) {
                        for (var n in play.materials) {
                            play.opacity = v;
                            play.materials[n].uniforms.opacity.value = v;
                        }
                        if (v == 0) {
                            for (var i in play.meshes) {
                                this.scene.remove(play.meshes[i]);
                            }
                            if (play.type == 'video') play.video.pause();
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

var click = function (event) {
    if (this.gettingPoints > -1) {
        this.points.push([
            (1 / (window.innerWidth / event.clientX) - 0.5) * 2,
            (1 / (window.innerHeight / (window.innerHeight - event.clientY)) - 0.5) * 2,
        ]);

        if (this.points.length == 4) {
            var newblocks = this.blocks;
            newblocks[this.gettingPoints].points = this.points;
            Meteor.call('minionSetting', this.data, 'blocks', newblocks);
            this.gettingPoints = -1;
        }
    }
}
    
var keypress = function (event) {
    console.log(event.keyCode, event.code);
    var key = parseInt(String.fromCharCode(event.which));
    console.log(key);
    if (key > 0 && key <= this.blocks.length) {
        this.gettingPoints = key - 1;
        this.points = [];
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
    
    this.gettingPoints = -1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 1;

    this.media_height = 2 * Math.tan((this.camera.fov * Math.PI / 180) / 2);
    this.media_width = this.media_height * this.camera.aspect;
        
    window.addEventListener('resize', resize.bind(this));
    window.addEventListener('click', click.bind(this));
    window.addEventListener('keypress', keypress.bind(this));

    this.light = new THREE.AmbientLight(0xFFFFFF);
    this.scene.add(this.light);
    
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    $('.media-container').append(this.renderer.domElement);
        
    this.continue = true;    
    this.render();
    
    thing = this;
    
    minions.find(this.data).observeChanges({
        added: changed.bind(this),
        changed: changed.bind(this)
    });
});

Template.webminionmedia.onDestroyed(function () {
    $('body').removeClass('no-scrollbars');
    this.continue = false;
});
