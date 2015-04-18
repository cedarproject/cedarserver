// Shaders stolen from http://stackoverflow.com/questions/20661941/how-to-map-texture-on-a-custom-non-square-quad-in-three-js
var vertexShader = 'varying vec4 textureCoord; void main() {textureCoord = vec4(uv,0.0, 1.0); if(uv.y != 0.0) {textureCoord.w *= (uv.y);} gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}';

var fragmentShader = 'uniform sampler2D uSampler; uniform float opacity; varying vec4 textureCoord; void main() {gl_FragColor  = texture2D(uSampler, vec2(textureCoord.x/textureCoord.w, textureCoord.y/textureCoord.w)); gl_FragColor.a = opacity;}';

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
        
        var plane = new THREE.Geometry();

        if (block['points']) {
            plane.vertices.push(new THREE.Vector3(block.points[0][0] * this.media_width, block.points[0][1] * this.media_height, 0));
            plane.vertices.push(new THREE.Vector3(block.points[1][0] * this.media_width, block.points[1][1] * this.media_height, 0));
            plane.vertices.push(new THREE.Vector3(block.points[2][0] * this.media_width, block.points[2][1] * this.media_height, 0));
            plane.vertices.push(new THREE.Vector3(block.points[3][0] * this.media_width, block.points[3][1] * this.media_height, 0));

            plane.faces.push(new THREE.Face3(0, 2, 3));
            plane.faces.push(new THREE.Face3(0, 3, 1));
        }
            
        var vratio = Math.abs(plane.vertices[1].x - plane.vertices[0].x) /
                    Math.abs(plane.vertices[3].x - plane.vertices[2].x);

        var hratio = Math.abs(plane.vertices[0].y - plane.vertices[1].y) /
                    Math.abs(plane.vertices[2].y - plane.vertices[3].y);
        
        var uvs = [
            new THREE.Vector2(block.x, block.y + block.height),
            new THREE.Vector2((block.x + block.width) * vratio, (block.y + block.height) * vratio),
            new THREE.Vector2(block.x, block.y * vratio),
            new THREE.Vector2(block.x + block.width, block.y),
        ];
        
        plane.faceVertexUvs[0][0] = [uvs[0], uvs[2], uvs[3]];
        plane.faceVertexUvs[0][1] = [uvs[0], uvs[3], uvs[1]];
//        plane.faceVertexUvs[0][0] = [uvs[0], uvs[1], uvs[2]];
//        plane.faceVertexUvs[0][1] = [uvs[0], uvs[2], uvs[3]];
                
        var mesh = new THREE.Mesh(plane, play.material);
        
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
            
            if (m.type == 'video' || m.type == 'image') {
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
                }
                
                else if (m.type == 'image') {
                    play.type = 'image';
                    play.texture = THREE.ImageUtils.loadTexture(settings.findOne({key: 'mediaurl'}).value + m.location);
                    play.texture.minFilter = THREE.LinearFilter;
                    play.texture.magFilter = THREE.LinearFilter;
                }

                var customUniforms = {
                    uSampler: {type: 't', value: play.texture},
                    opacity: {type: 'f', value: 0},
                };
            
                play.material = new THREE.ShaderMaterial({
                    uniforms: customUniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    side: THREE.DoubleSide,
                    transparent: true
                });
                
                play.meshes = this.create_blocks(play);
                                                
                this.fades.push({
                    start: 0, end: 1,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (m,v) {m.uniforms.opacity.value = v}.bind(this, play.material)
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
            if (play.type == 'video' || play.type == 'image') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.options['fade'] || 1,
                    time: window.performance.now(),
                    callback: function (play,v) {
                        play.material.opacity = v;
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
            1 / (window.innerWidth / event.clientX) - 0.5,
            1 / (window.innerHeight / (window.innerHeight - event.clientY)) - 0.5,
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
    
    minions.find(this.data).observeChanges({
        added: changed.bind(this),
        changed: changed.bind(this)
    });
});

Template.webminionmedia.onDestroyed(function () {
    $('body').removeClass('no-scrollbars');
    this.continue = false;
});
