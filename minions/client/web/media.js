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
    '    gl_FragColor.a *= opacity;',
    '}'
].join('\n');
    
var render = function () {
    if (this.continue) {
        requestAnimationFrame(this.render.bind(this));
        
        for (i = this.fades.length-1; i >= 0; i--) {
            var fade = this.fades[i];
            if (!fade['curr']) fade.curr = fade.start;
            
            var currtime = Date.now() * 0.001;
            if (currtime < fade.time) continue;
            
            var elapsed = currtime - fade.time;
                        
            if (fade.curr < fade.end) {
                fade.curr = fade.end / (fade.length / elapsed);
                if (fade.curr > fade.end || isNaN(fade.curr)) fade.curr = fade.end;
            }
                
            else if (fade.curr > fade.end) {
                fade.curr = 1.0 / (fade.length / (fade.length - elapsed));
                if (fade.curr < fade.end || isNaN(fade.curr)) fade.curr = fade.end;
            }

            fade.callback(fade.curr);
            if (fade.curr == fade.end) {
                this.fades.splice(i, 1);
            }
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

        console.log(play.texture.format);
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
        mesh.position.z = play.z;
        
        play.materials.push(material);
        play.meshes.push(mesh);
        this.scene.add(mesh);
    }
}

var changed = function (id, fields) {
    var newsettings = fields['settings'];
    var actions = fields['actions'];
    console.log(actions);
    
    if (newsettings) {
        if (newsettings['blocks']) {
            this.blocks = newsettings.blocks;
            resize.bind(this)();
/*            for (var i = 0; i < this.playing.length; i++) {
                var play = this.playing[i];
                if (play.type == 'video' || play.type == 'image') {
                    for (var i = 0; i < play.meshes.length; i++) {
                        this.scene.remove(play.meshes[i]);
                    }
                    this.create_blocks(play);
                }
            } */
        }
    }
    
    if (actions) for (var i in actions) {
        var action = actions[i];

        var isActive = false;
        for (var p in this.playing) {
            if (this.playing[p]._id == action._id) {
                if (action.type == 'song') {
                    if (this.playing[p] == action.args) isActive = true;
                }
                else isActive = true;
                break;
            }
        }
        
        if (isActive) continue;
        
        var play = {_id: action._id, settings: action.settings, args: action.args};

        if (action.type == 'media') {
            var m = media.findOne(action.media);
            
            if (m.type == 'video' || m.type == 'image') {
                if (m.type == 'video') {
                    play.type = 'video';
                    play.video = document.createElement('video');
                    play.video.src = settings.findOne({key: 'mediaurl'}).value + m.location;
                    play.video.controls = false;
                    play.video.autoplay = true;
//                    play.video.loop = true; // TODO make this a setting!
                    
                    play.video.addEventListener('ended', function () {
                        this.play();
                    }.bind(play.video));
                    
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
                play.z = 0;

                this.create_blocks(play);

                this.fades.push({
                    start: 0, end: 1,
                    length: play.settings['fade'] || 1,
                    time: action.time,
                    callback: function (v) {
                        for (var n in this.materials) {
                            this.opacity = v;
                            this.materials[n].uniforms.opacity.value = v;
                        }
                    }.bind(play)
                });
            }
            
            else if (m.type == 'audio') {
                play.type = 'audio';
                play.audio = document.createElement('audio');
                play.audio.src = settings.findOne({key: 'mediaurl'}).value + m.location;
                play.audio.controls = false;
                play.audio.autoplay = true;
//                play.audio.loop = true;
                play.audio.volume = 0;

                play.audio.addEventListener('ended', function () {
                    this.play();
                }.bind(play.audio));

                this.fades.push({
                    start: 0, end: 1,
                    length: play.settings['fade'] || 1,
                    time: action.time,
                    callback: function (v) {this.volume = v}.bind(audio)
                });
            }
        }
        
        else if (action.type == 'song') {
            play.type = 'song';

            if (!action.args) continue;
            var section = songsections.findOne(action.args.section)
            var contents = section.contents[action.args.index]
            play.text = contents.text.split('\n');
            
            play.canvas = document.createElement('canvas');
            play.canvas.width = window.innerWidth;
            play.canvas.height = window.innerHeight;

            play.cx = play.canvas.getContext('2d');

            play.cx.fillStyle = 'rgba(255,0,0,0.5)';
            play.cx.fill();

            play.cx.font = 'Bold 72px Impact'; // TODO should be grabbed from a setting!
            play.cx.textAlign = 'center';
            play.cx.textBaseline = 'middle';
            play.cx.fillStyle = 'white';
            
            for (var l in play.text) {
                var line = play.text[l];
                play.cx.fillText(line, window.innerWidth/2,
                    window.innerHeight/2 - (72 * play.text.length)/2 + (72 * l)
                );
            }
            
            play.texture = new THREE.Texture(play.canvas);
            play.texture.minFilter = THREE.LinearFilter;
            play.texture.magFilter = THREE.LinearFilter;
            play.texture.needsUpdate = true;

            play.materials = [];
            play.meshes = [];
            play.opacity = 0; //TODO this whole mess is ugly, fix it! 
            play.z = 0.001;

            this.create_blocks(play);            

            this.fades.push({
                start: 0, end: 1,
                length: play.settings['fade'] || 1,
                time: action.time,
                callback: function (v) {
                    for (var n in this.materials) {
                        this.opacity = v;
                        this.materials[n].uniforms.opacity.value = v;
                    }
                }.bind(play)
            });
        }

        this.playing.push(play);
    }

    if (actions) for (var i = this.playing.length - 1; i >= 0; i--) {
        var play = this.playing[i];
        
        var isActive = false;
        for (var a in actions) {
            if (actions[a]._id == play._id) {
                if (actions[a].type == 'song') {
                    console.log(actions[a].args == play.args);
                    if (actions[a].args == play.args) isActive = true;
                }
                else isActive = true;
                break;
            }
        }
            
        if (!isActive) {
            console.log('removing');
            if (play.type == 'video' || play.type == 'image') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.settings['fade'] || 1,
                    time: Date.now() * 0.001,
                    callback: function (scene ,v) {
                        for (var n in this.materials) {
                            this.opacity = v;
                            this.materials[n].uniforms.opacity.value = v;
                        }
                        if (v == 0) {
                            for (var i in this.meshes) {
                                scene.remove(this.meshes[i]);
                            }
                            if (play.type == 'video') {
                                this.video.pause();
                                $(this.video).remove();
                            }
                        }
                    }.bind(play, this.scene)
                });
                
            }
            
            else if (play.type == 'audio') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.settings['fade'] || 1,
                    time: Date.now() * 0.001,
                    callback: function (v) {
                        this.volume = v;
                        if (v == 0) {
                            this.pause();
                            $(this).remove();
                        }
                    }.bind(play.audio)
                });
            }
            
            else if (play.type == 'song') {
                this.fades.push({
                    start: 1, end: 0,
                    length: play.settings['fade'] || 1,
                    time: Date.now() * 0.001,
                    callback: function (scene, v) {
                        for (var n in this.materials) {
                            this.opacity = v;
                            this.materials[n].uniforms.opacity.value = v;
                        }
                        if (v == 0) {
                            for (var i in this.meshes) {
                                scene.remove(this.meshes[i]);
                            }
                        }
                    }.bind(play, this.scene)
                });
            }

            this.playing.pop(i);
        }
        
        console.log(this.playing);
    }
}

var resize = function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.media_height = 2 * Math.tan((this.camera.fov * Math.PI / 180) / 2);
    this.media_width = this.media_height * this.camera.aspect;
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    for (var i = 0; i < this.playing.length; i++) {
        var play = this.playing[i];
        if (play.meshes && (play.type == 'video' || play.type == 'image' || play.type == 'song')) {
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
    var key = parseInt(String.fromCharCode(event.which));
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
