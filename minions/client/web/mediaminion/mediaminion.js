var vertShaderSource = `
    uniform mat4 uTransformMatrix;
    varying vec2 vUv;
    void main(void) {
        vUv = uv;
        gl_Position = uTransformMatrix * vec4( position, 1.0 );
    }
`;

var fragShaderSource = `
    varying vec2 vUv;
    uniform sampler2D uSampler;
    uniform float brightness;
    uniform float opacity;
    uniform vec4 borders;
    void main (void) {
        if (vUv[0] <= borders[0] || vUv[0] >= borders[2] || vUv[1] <= borders[1] || vUv[1] >= borders[3]) {
            gl_FragColor = vec4(0, 0, 0, 1);
        }
        
        else {
            vec2 corrected;
            corrected[0] = (vUv[0] - borders[0]) / (borders[2] - borders[0]);
            corrected[1] = (vUv[1] - borders[1]) / (borders[3] - borders[1]);
                
            gl_FragColor = texture2D(uSampler, corrected);
        }

        gl_FragColor *= vec4(brightness, brightness, brightness, opacity);
    }
`;

var getScale = function (width, height, maxwidth, maxheight) {
    var ratio = Math.min(maxwidth / width, maxheight / height);
    return [width * ratio, height * ratio];
};

var getBorders = function (width, height) {
    var scale = getScale(width, height, window.innerWidth, window.innerHeight);
    
    scale[0] /= window.innerWidth;
    scale[1] /= window.innerHeight;

    return [(1 - scale[0]) / 2, (1 - scale[1]) / 2, 1 - ((1 - scale[0]) / 2), 1 - ((1 - scale[1]) / 2)];
};
    
var render = function () {
    if (this.continue) {
        requestAnimationFrame(this.render.bind(this));
        
        for (i = this.fades.length-1; i >= 0; i--) {
            var fade = this.fades[i];
            if (!fade['curr']) fade.curr = fade.start;
            
            var currtime = time.now();
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
};  

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
        
        if ((play.type == 'video' || play.type == 'image' || play.type == 'streamingsource')
            && combineSettings(play.settings).media_preserve_aspect == 'yes') {
                if (play.video) var borders = getBorders(play.video.videoWidth, play.video.videoHeight);
                else if (play.image) var borders = getBorders(play.image.width, play.image.height);
        } else var borders = [0, 0, 1, 1];
                
        var material = new THREE.ShaderMaterial({
            vertexShader: vertShaderSource,
            fragmentShader: fragShaderSource,
            transparent: true,  
            uniforms: {
                brightness: {type: 'f', value: block.brightness || 1.0},
                opacity: {type: 'f', value: play.opacity},
                uTransformMatrix: {type: 'm4', value: matrix},
                uSampler: {type: 't', value: play.texture},
                borders: {type: 'v4', value: new THREE.Vector4(borders[0], borders[1],
                                                               borders[2], borders[3])}
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
};

var changed = function (id, fields) {
    var newsettings = fields['settings'];
    var layers = fields['layers'];
    var stage = fields['stage'];
    
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
            if (action._id == this.layers[i].action._id) {
                if (action.type == 'song') {
                    if (action.args && this.layers[i].args && 
                        action.args.section == this.layers[i].args.section &&
                        action.args.index == this.layers[i].args.index) 
                            continue;
                }
                
                else if (action.type == 'presentation') {
                    if (action.args && this.layers[i].action.args &&
                        action.args.order == this.layers[i].order &&
                        action.args.fillin == this.layers[i].fillin)
                            continue;
                }
                
                else continue;
            }
        }
                
        // Set up the new action
        if (action) {
            var old = this.layers[i];

            var actionmap = {
                media: MediaMinionMedia,
                playlist: MediaMinionPlaylist,
                song: MediaMinionSong,
                presentation: MediaMinionPresentation,
                streamingsource: MediaMinionStreamingSource,
                streamingmix: MediaMinionStreamingMix,
                'clear-layer': MediaMinionClearLayer,
                timer: MediaMinionTimer
            };
            
            this.layers[i] = new actionmap[action.type](action, this);
            this.layers[i].show(old);
        }
        
        else if (this.layers[i]) {
            this.layers[i].hide();
            this.layers[i].remove();
            this.layers[i] = null;
        }
    }
};

var resize = function () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.media_height = 2 * Math.tan((this.camera.fov * Math.PI / 180) / 2);
    this.media_width = this.media_height * this.camera.aspect;
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    for (var i in this.layers) {
        if (this.layers.hasOwnProperty(i) && this.layers[i]) var play = this.layers[i];
        else continue;

        if (play.meshes && (play.type == 'video' || play.type == 'image' ||
                play.type == 'song' || play.type == 'presentation')) {
            for (var i = 0; i < play.meshes.length; i++) {
                this.scene.remove(play.meshes[i]);
            }
            play.meshes = [];
            this.create_blocks(play);            
        }
    }
};

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
};
    
var keypress = function (event) {
    var key = parseInt(String.fromCharCode(event.which));
    if (key > 0 && key <= this.blocks.length) {
        this.gettingPoints = key - 1;
        this.points = [];
    }
};

Template.webminionmedia.onRendered(function () {
    $('body').addClass('no-scrollbars');
    this.render = render;
    this.create_blocks = create_blocks;
    this.getScale = getScale;
    
    this.settings = combineSettings(this.data.settings);
    this.stage = stages.findOne(this.data.stage);

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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.setClearColor(new THREE.Color(parseInt(this.settings.mediaminion_background_color)), 1);

    $('.media-container').append(this.renderer.domElement);
        
    this.continue = true;    
    this.render();
    
    minions.find(this.data._id).observeChanges({
        added: changed.bind(this),
        changed: changed.bind(this)
    });
    
    Meteor.call('streamingConnected', (err, res) => {
        if (!err && res) {
            this.source = streamingsources.findOne({type: 'minion', 'settings.streamingsource_minion': this.data._id});
            if (this.source) mediaminion_stream(this.source, this.renderer.domElement);
        }
    });
});

Template.webminionmedia.onDestroyed(function () {
    $('body').removeClass('no-scrollbars');
    this.continue = false;
});
