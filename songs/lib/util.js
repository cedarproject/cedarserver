transpose_scale = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B','C', 'Db','D','D#','E','F','Gb','G','G#','A','A#', 'B', 'C'];

key2num = {'A': 0, 'Bb': 1, 'B': 2, 'C': 3, 'C#': 4, 'Db': 4, 'D': 5, 'D#': 6, 'Eb': 6, 'E': 7, 'F': 8, 'F#': 9, 'Gb': 9, 'G': 10, 'G#': 11, 'Ab': 11};
num2key = {};
for (var p in key2num) if (key2num.hasOwnProperty(p)) num2key[key2num[p]] = p;

songTextToCanvas = function (text) {
    return text.replace(/\[[^\[]*\]/g, '').replace(/  +/g, ' ');;
};

songTextToHTML = function (text) {
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>')
    text = text.replace(/\[[^\[]*\]/g, '');
    return text;
};

songTextToChordChart = function (text, transpose) {
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    text = text.replace(/\[[^\[]*\]/g, function (tag) {        
        tag = tag.substring(1, tag.length-1);
        tag = tag.replace(/[CDEFGAB][#b]?/g, function (chord) {
            var n = transpose_scale.indexOf(chord) + transpose;
            return transpose_scale[n < 0 ? n + transpose_scale.length - 1 : n];
        });
        
        return '<span class="musicstand-chord"><span>' + tag + '</span></span>';
    });
    
    return text;
};
