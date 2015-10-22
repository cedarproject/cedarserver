defaults = {
    fade: 1,

    songs_font: 'sans-serif',
    songs_font_size: '72',
    songs_font_weight: 'bold', // (normal, bold)
    songs_font_color: 'white',
    songs_font_shadow: '1',
    songs_font_shadow_color: 'black',

    songs_text_align: 'center', // Horizontal alignment (left, center, right)
    songs_text_vertical_align: 'center', // Vertical alignment (top, center, bottom)
    
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
    
    presentations_custom_css: '#content {}'
};

combineSettings = function () {
    var out = Object.create(defaults);
    
    for (var i in arguments) {
        for (var p in arguments[i]) {
            if (arguments[i].hasOwnProperty(p) && arguments[i][p] !== null)
                out[p] = arguments[i][p];
        }
    }
    
    return out;
};
