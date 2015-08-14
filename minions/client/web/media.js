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
    'uniform float brightness;',
    'uniform float opacity;',
    'void main(void)  {',
    '    gl_FragColor = texture2D(uSampler, vUv);',
    '    gl_FragColor *= vec4(brightness, brightness, brightness, opacity);',
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

        var material = new THREE.ShaderMaterial({
            vertexShader: vertShaderSource,
            fragmentShader: fragShaderSource,
            transparent: true,  
            uniforms: {
                brightness: {type: 'f', value: block.brightness || 1.0},
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
    var layers = fields['layers'];
    
    if (newsettings) {
        this.settings = newsettings;
        if (newsettings['blocks']) {
            this.blocks = newsettings.blocks;
            resize.bind(this)();
        }
    }
    
    if (layers) for (var i in layers) {
        if (layers.hasOwnProperty(i)) var action = layers[i];
        else continue;
                        
        // Check if the layer's action has changed.
        if (action != null && this.layers[i]) {
            if (action._id == this.layers[i]._id) {
                if (action.type == 'song') {
                    if (action.args && this.layers[i].args && 
                        action.args.section == this.layers[i].args.section &&
                        action.args.index == this.layers[i].args.index)
                            continue;
                }
                else continue;
            }
        }
        
        // Remove the layer's previous action, if any.    
        if (this.layers[i]) {
            var play = this.layers[i];

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
        }
        
        // Set up the new action
        if (action) {
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
                        callback: function (v) {this.volume = v}.bind(play.audio)
                    });
                }
            }
            
            else if (action.type == 'song') {
                play.type = 'song';

                if (!(action.args.section && action.args.index)) continue;
                var section = songsections.findOne(action.args.section);
                var contents = section.contents[action.args.index];
                play.text = contents.text.split('\n');
                
                var s = combineSettings(this.settings);
                
                play.canvas = document.createElement('canvas');
                play.canvas.width = window.innerWidth;
                play.canvas.height = window.innerHeight;

                play.cx = play.canvas.getContext('2d');

                play.cx.font = [s.songs_font_weight, s.songs_font_size + 'px',s.songs_font].join(' ');
                play.cx.textAlign = s.songs_text_justify;
                play.cx.fillStyle = s.songs_font_color;
                play.cx.strokeStyle = s.songs_font_outline + 'px ' + s.songs_font_outline_color;
                
                if (s.songs_text_justify == 'left') var x = 0;
                else if (s.songs_text_justify == 'center') var x = window.innerWidth/2;
                else if (s.songs_text_justify == 'right') var x = window.innerWidth;
                
                if (s.songs_text_align == 'top') {
                    play.cx.textBaseline = 'top';
                    var y = 0;
                } else if (s.songs_text_align == 'center') {
                    play.cx.textBaseline = 'middle';
                    var y = window.innerHeight/2 - (s.songs_font_size * play.text.length)/2;
                } else if (s.songs_text_align == 'bottom') {
                    play.cx.textBaseline = 'bottom';
                    var y = window.innerHeight - s.songs_font_size * play.text.length;
                }
                                
                for (var l in play.text) {
                    var line = play.text[l];

                    play.cx.fillText(line, x, y + (s.songs_font_size * l), window.innerWidth);                    
                    play.cx.strokeText(line, x, y + (s.songs_font_size * l), window.innerWidth);                                        
                }
                
                play.texture = new THREE.Texture(play.canvas);
                play.texture.minFilter = THREE.LinearFilter;
                play.texture.magFilter = THREE.LinearFilter;
                play.texture.needsUpdate = true;

                play.materials = [];
                play.meshes = [];
                play.opacity = 0;
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
        }

        if (action) this.layers[i] = play;
        else this.layers[i] = null;
    }
}

var resize = function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.media_height = 2 * Math.tan((this.camera.fov * Math.PI / 180) / 2);
    this.media_width = this.media_height * this.camera.aspect;
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    for (var i in this.layers) {
        if (this.layers.hasOwnProperty(i) && this.layers[i]) var play = this.layers[i];
        else continue;

        if (play.meshes && (play.type == 'video' || play.type == 'image' || play.type == 'song')) {
            for (var i = 0; i < play.meshes.length; i++) {
                this.scene.remove(play.meshes[i]);
            }
            play.meshes = [];
            this.create_blocks(play);            
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
    
    this.settings = {};
    this.layers = {};
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
