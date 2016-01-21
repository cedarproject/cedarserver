key2num = {'A': 0, 'A#': 1, 'Bb': 1, 'B': 2, 'C': 3, 'C#': 4, 'Db': 4, 'D': 5, 'D#': 6, 'Eb': 6, 'E': 7, 'F': 8, 'F#': 9, 'Gb': 9, 'G': 10, 'G#': 11, 'Ab': 11};
num2keyflat = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab'];
num2keysharp = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];

songTextToCanvas = function (text) {
    return text.replace(/\[[^\[]*\]/g, '').replace(/  +/g, ' ');;
};

songTextToHTML = function (text) {
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>')
    text = text.replace(/\[[^\[]*\]/g, '');
    return text;
};

songTextToChordChart = function (text, transpose, flat) {
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    text = text.replace(/\[[^\[]*\]/g, (tag) => {
        if (tag[tag.length-2] == '_') {
            var full = true;
            tag = tag.substring(1, tag.length-2);
        } else {
            var full = false;
            tag = tag.substring(1, tag.length-1);
        }

        tag = tag.replace(/[CDEFGAB][#b]?/g, (chord) => {
            var n = (key2num[chord] + transpose) % 12;
            if (n < 0) n += 12;

            if (flat) return num2keyflat[n];
            else return num2keysharp[n];
        });
        
        if (full) return `<span class="musicstand-chord-full"><span>${tag}</span></span>`;
        else return `<span class="musicstand-chord"><span>${tag}</span></span>`;
    });
    
    return text;
};
