defaults = JSON.stringify({
    mediaminion_background_color: '0x000000',
    mediaminion_volume: 1, // Per-minion upper limit

    media_fade: 1,
    media_preserve_aspect: 'yes',
    media_loop: 'no',
    media_volume: 1, // Per-item volume, limited by minion's limit
    
    playlist_image_length: 5,
    playlist_order: 'normal', // (normal, random)

    songs_fade: 0.25,
    songs_font: 'sans-serif',
    songs_font_size: '72',
    songs_font_weight: 'bold', // (normal, bold)
    songs_font_color: 'white',
    songs_font_shadow: '1',
    songs_font_shadow_color: 'black',

    songs_text_align: 'center', // Horizontal alignment (left, center, right)
    songs_text_vertical_align: 'center', // Vertical alignment (top, center, bottom)
    
    presentations_fade: 0.25,
    presentations_font: 'sans-serif',
    presentations_font_size: '48',
    presentations_font_weight: 'bold',
    presentations_font_color: 'white',
    presentations_font_shadow: '0',
    presentations_font_shadow_color: 'black',
    
    presentations_position_horizontal: 'left', // Horizontal alignment (left, center, right)
    presentations_position_vertical: 'top', // Vertical alignment (top, center, bottom)
    presentations_width: 100,
    presentations_height: 100,
    
    presentations_image_side: 'right', // (left, right, top, bottom)
    
    presentations_custom_css: '#content {}',
    
    timers_fade: 0.25,
    
    timer_type: 'countdown', // (countdown, startAt, endAt)
    timers_font: 'monospace',
    timers_font_size: '32',
    timers_font_weight: 'bold',
    timers_font_color: 'white',
    timers_font_shadow: '1', 
    timers_font_shadow_color: 'black',
    
    timers_text_align: 'left', // Horizontal alignment (left, center, right)
    timers_text_vertical_align: 'bottom', // Vertical alignment (top, center, bottom)
    
    streamingsource_width: 0,
    streamingsource_height: 0,
    streanubgsourec_url: '',
    
    lights_fade: 1,
});

combineSettings = function () {
    var out = JSON.parse(defaults); // Hacky way of copying the defaults object.
    
    for (var i in arguments) {
        for (var p in arguments[i]) {
            if (arguments[i].hasOwnProperty(p) && typeof arguments[i][p] !== 'null' && typeof arguments[i][p] !== 'undefined')
                out[p] = arguments[i][p];
        }
    }
    
    return out;
};
