// A simple seedable PRNG stolen from StackOverflow.
function random(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

MediaMinionPlaylist = class MediaMinionPlaylist {
    constructor (action, minion) {
        this.shown = false;
        this.removed = false;
        
        this.action = action;
        this.minion = minion;
        
        this.playlist = mediaplaylists.findOne(this.action.playlist);
        this.settings = combineSettings(this.action.settings, this.playlist.settings, this.minion.settings);

        this.time = this.action.time;

        // this.settings is passed directly to child media, forcing looping off due to laziness.
        this.loop = this.settings.media_loop;
        this.settings.media_loop = 'no';
        
        if (this.settings.playlist_order == 'normal') {
            this.order = this.playlist.contents;
        }
        
        else if (this.settings.playlist_order == 'random') {
            this.order = [];
            var contents = this.playlist.contents.slice(0);
            
            for (var i = 0; i < this.playlist.contents.length; i++) {
                var r = Math.floor(random(this.action.time + i) * contents.length)
                this.order.push(contents.splice(r, 1)[0]);
            }
            
        }
        
        this.index = 0;
        this.cb = this.next.bind(this);
        this.current = null;
    }
    
    next (caller) {
        if (this.shown) {
            if (this.index >= this.order.length) {
                if (this.loop == 'yes') this.index = 0;
                else {
                    this.current.hide();
                    this.current.remove();
                    this.current = null;
                    return;
                }
            }
            
            if (this.current) {
                if (this.current.type == 'audio' || this.current.type == 'video') {
                    this.time += this.current.tosync.duration * 1000;
                    this.current.tosync.removeEventListener('ended', this.cb);
                } else if (this.current.type == 'image') {
                    this.time += this.settings.playlist_image_length * 1000;
                }
            }
            
            var a = {
                media: this.order[this.index],
                settings: this.settings,
                layer: this.action.layer,
                time: this.time,
            }
            
            if (this.current) this.old = this.current;
            this.current = new MediaMinionMedia(a, this.minion);
            this.current.show(this.old);
            
            if (this.current) {
                if (this.current.type == 'audio' || this.current.type == 'video') {
                    this.current.tosync.addEventListener('ended', this.cb);
                } else if (this.current.type == 'image') {
                    Meteor.setTimeout(this.cb, this.settings.playlist_image_length * 1000);
                }
            }
            
            this.index++;
        }
    }
    
    show (old) {
        this.shown = true;
        this.old = old;
        this.next('show');
    }
    
    hide () {
        this.shown = false;
        
        if (this.current) {
            this.current.hide();
            this.current.remove();
            this.current = null;
            this.index = 0;
        }
    }
    
    remove () {
        if (!this.shown) {
            this.removed = true;
        }
        
        else Meteor.setTimeout(100, this.remove.bind(this));
    }
};
