// This got a bit out of hand...

MediaMinionPresentation = class MediaMinionPresentation {
    constructor (action, minion) {
        this.canremove = true;
        this.ready = false;
        this.blank = false;
    
        this.action = action;
        this.minion = minion;
    
        this.type = 'presentation';
        this.time = action.time;
        
        this.pres = presentations.findOne(this.action.presentation);
        
        if (action.args.order === undefined) {
            this.blank = true;
            return;
        }

        this.slide = presentationslides.findOne({presentation: this.action.presentation, order: this.action.args.order});

        this.settings = combineSettings(this.action.settings, this.slide.settings, this.pres.settings, this.minion.settings);

        this.html = this.slide.content;
        this.imageids = this.slide.images;
        this.images = [];
        
        this.loaded = 0;
        this.toload = 0;

        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.cx = this.canvas.getContext('2d');

        var render = () => {
            this.loaded++;
            if (this.loaded < this.toload) return;
            
            if (this.domimg)
                this.cx.drawImage(this.domimg, 0, 0, window.innerWidth, window.innerHeight);
            
            if (this.images) {
                var rows = Math.round(Math.sqrt(this.images.length));
                var columns = Math.ceil(this.images.length / rows);
                
                var width = window.innerWidth * (this.settings.presentations_width / 100);
                var height = window.innerHeight * (this.settings.presentations_height / 100);
                
                if (this.settings.presentations_position_horizontal == 'left')
                    var x = 0;
                else if (this.settings.presentations_position_horizontal == 'center')
                    var x = (window.innerWidth - width) / 2;
                else if (this.settings.presentations_position_horizontal == 'right')
                    var x = window.innerWidth - width;
                    
                if (this.settings.presentations_position_vertical == 'top')
                    var y = 0;
                else if (this.settings.presentations_position_vertical == 'center')
                    var y = (window.innerHeight - height) / 2;
                else if (this.settings.presentations_position_vertical == 'bottom')
                    var y = window.innerHeight - height;
                
                if (this.html.length > 0) {
                    if (this.settings.presentations_image_side == 'left') {
                        width /= 2;
                    } else if (this.settings.presentations_image_side == 'right') {
                        x += width / 2;
                        width /= 2;
                    } else if (this.settings.presentations_image_side == 'top') {
                        height /= 2;
                    } else if (this.settings.presentations_image_side == 'bottom') {
                        y += height / 2;
                        height /= 2;
                    }
                }
                                        
                var gridx = width / rows;
                var gridy = height / columns;
                
                for (var n in this.images) {
                    var img = this.images[n];
                    var row = n % rows;
                    var col = Math.floor(n / rows);
                    
                    var size = this.minion.getScale(img.width, img.height, gridx, gridy);
                    
                    var offx = (gridx - size[0]) / 2;
                    var offy = (gridy - size[1]) / 2;
                    
                    this.cx.drawImage(img, 
                        x + offx + gridx * row, 
                        y + offy + gridy * col,
                        size[0], size[1]
                    );
                }
            }
            
            this.texture = new THREE.Texture(this.canvas);
            this.texture.minFilter = THREE.LinearFilter;
            this.texture.magFilter = THREE.LinearFilter;
            this.texture.needsUpdate = true;
            
            this.materials = [];
            this.meshes = [];
            this.opacity = 0;

            this.z = this.minion.stage.settings.layers.indexOf(this.action.layer) * 0.001;
            
            this.ready = true;
        };
        
        if (this.html.length > 0) {
            var offset_top = 0;
            var offset_left = 0;

            if (this.settings.presentations_position_vertical == 'top') {
                var container_vertical = 'top: 0';
            } else if (this.settings.presentations_position_vertical == 'center') {
                var container_vertical = 'top: 50%';
                var offset_top = '-50%';
            } else if (this.settings.presentations_position_vertical == 'bottom') {
                var container_vertical = 'bottom: 0';
            }
            
            if (this.settings.presentations_position_horizontal == 'left') {
                var container_horizontal = 'left: 0';
            } else if (this.settings.presentations_position_horizontal == 'center') {
                var container_horizontal = 'left: 50%';
                var offset_left = '-50%';
            } else if (this.settings.presentations_position_horizontal == 'right') {
                var container_horizontal = 'right: 0';
            }
                            
            var content_width = '100%';
            var content_height = '100%';
            var content_x = '0%';
            var content_y = '0%';

            if (this.imageids.length > 0) {
                 if (this.settings.presentations_image_side == 'left') {
                    var content_width = '50%';
                    var content_x = '50%';
                } else if (this.settings.presentations_image_side == 'right') {
                    var content_width = '50%';
                } else if (this.settings.presentations_image_side == 'top') {
                    var content_height = '50%';
                    var content_y = '50%';
                } else if (this.settings.presentations_image_side == 'bottom') {
                    var content_height = '50%';
                }
            }
                                
            var style = `
                #container {
                    position: absolute;
                    width: ${this.settings.presentations_width}vw;
                    height: ${this.settings.presentations_height}vh;
                    ${container_vertical};
                    ${container_horizontal};
                }
                
                #offset {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    left: ${offset_left};
                    top: ${offset_top};
                }
                
                #content {
                    position: relative;
                    left: ${content_x};
                    top: ${content_y};
                    max-width: ${content_width};
                    max-height: ${content_height};
                    
                    font-family: ${this.settings.presentations_font};
                    font-size: ${this.settings.presentations_font_size}px;
                    font-weight: ${this.settings.presentations_font_weight};
                    color: ${this.settings.presentations_font_color};
                    text-shadow: 0 0 ${this.settings.presentations_font_shadow}px ${this.settings.presentations_font_shadow_color};
                }
                
                s {
                    text-decoration-line: none;
                }
                
                .hidden {
                    color: rgba(0,0,0,0);
                    text-shadow: none;
                }
                
                ${this.settings.presentations_custom_css}
            `;
            
            var dom = new DOMParser().parseFromString(this.html, 'text/html');
            
            $('s', dom).each((i, e) => {
                if (i >= this.action.args.fillin) {
                    $(e).addClass('hidden');
                    var p = $(e).parent();
                    if (p.is('li') && p.contents().length == 1)
                        p.addClass('hidden');
                }
            });

            this.content = new XMLSerializer().serializeToString(dom);
            
            this.blob = new Blob([`
                <svg xmlns="http://www.w3.org/2000/svg" width="${window.innerWidth}px" height="${window.innerHeight}px">
                    <foreignObject width="100%" height="100%">
                        <div xmlns="http://www.w3.org/1999/xhtml">
                            <style>${style}</style>
                            <div id="container">
                                <div id="offset">
                                    <div id="content">${this.content}</div>
                                </div>
                            </div>
                        </div>
                    </foreignObject>
                </svg>
            `], {type: 'image/svg+xml;charset=utf-8'});

            this.url = window.URL.createObjectURL(this.blob);

            this.domimg = new Image(window.innerWidth, window.innerHeight);
            this.domimg.src = this.url;
            this.domimg.onload = render;
            
            this.toload++;
        }
        
        if (this.imageids.length > 0) {
            this.images = [];

            for (var n in this.imageids) {
                var m = media.findOne(this.imageids[n]);

                var img = new Image();
                img.src = '/media/static/' + m.location;
                img.onload = render;
                
                this.images.push(img);
                this.toload++;
            }                    
        }
        
        if (this.toload == 0) render();
    }
    
    show (old) {
        if (this.blank) {
            if (old) {
                old.hide();
                old.remove();
            }
            
            return;
        }
    
        if (this.ready) {
            this.canremove = false;
            
            if (old) {
                old.hide();
                old.remove();
            }
                        
            this.minion.create_blocks(this);

            this.minion.fades.push({
                start: 0, end: 1,
                length: parseFloat(this.settings.presentations_fade) * 1000,
                time: this.time,
                callback: (v) => {
                    this.opacity = v;
                    for (var n in this.materials) {
                        this.materials[n].uniforms.opacity.value = v;
                    }
                }
            });
        }
        
        else Meteor.setTimeout(this.show.bind(this, old), 100);
    }
    
    hide () {
        if (this.blank) return;
        
        this.minion.fades.push({
            start: 1, end: 0,
            length: parseFloat(this.settings.presentations_fade) * 1000,
            time: time.now(),
            callback: (v) => {
                for (var n in this.materials) {
                    this.opacity = v;
                    this.materials[n].uniforms.opacity.value = v;
                }
                
                if (v == 0) {
                    for (var i in this.meshes) {
                        this.minion.scene.remove(this.meshes[i]);
                    }
                    
                    this.canremove = true;
                }
            }
        });
    }
    
    remove () {
        if (this.blank) {
            this.removed = true;
            return;
        }

        if (this.canremove) {
            $(this.canvas).remove();
            $(this.domimg).remove();
            this.images.forEach((img) => {$(img).remove()});
            window.URL.revokeObjectURL(this.url);
            this.removed = true;
        }
        
        else Meteor.setTimeout(this.remove.bind(this), 100);
    }
}
