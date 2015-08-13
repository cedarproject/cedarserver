defaults = {
    fade: 1,

    songs_font: 'sans-serif',
    songs_font_size: '72',
    songs_font_weight: 'bold',
    songs_font_color: 'white',
    songs_font_outline: '1',
    songs_font_outline_color: 'black',

    songs_text_align: 'center', // Vertical alignment (top, center, bottom)
    songs_text_justify: 'center', // Horizontal justification (left, center, right)    
};

combineSettings = function () {
    var out = defaults;
    for (var i in arguments) {
        for (var p in arguments[i]) {
            if (arguments[i].hasOwnProperty(p) && arguments[i][p] !== null)
                out[p] = arguments[i][p];
        }
    }
    
    return out;
};
