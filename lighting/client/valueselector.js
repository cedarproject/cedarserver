 toHexColor = function (i) {return ('0' + Math.round(i * 255 || 0).toString(16)).slice(-2)};

Template.valueSelector.helpers({
    channels: function () {
        var dc = [];
        for (var c in this.channels) {
            var channel = this.channels[c];
            channel.index = c;
            if (channel.type != 'fixed') dc.push(channel);
        }

        return dc;
    },
    
    hasColor: function () {
        for (var i in this.channels) {
            if (['red', 'green', 'blue'].indexOf(this.channels[i].type) != -1) return true;
        }
        
        return false;
    },

    // TODO getColor is apparently buggy and causes the colordisplay to come up black sometimes, fix!
    // Also adjust so it still works if not all colors are present, and account for intensity values.
    getColor: function () {
        var color = {red: 0, green: 0, blue: 0, intensity: 1};
        for (var c in this.channels) {
            color[this.channels[c].type] = this.values[c];
        }

        var string = '#' + toHexColor(color.red * color.intensity) + toHexColor(color.green * color.intensity) + toHexColor(color.blue * color.intensity);
        return string;
    },
});

Template.valueSelector.onRendered(function () {
    this.$('.value-slider').slider({max: 1, step: 0.01, tooltip: 'hide'});
    
    this.autorun(function () {
        var d = Template.currentData()
        for (var c in d.channels) {
            Template.instance().$('#' + d.channels[c].type).slider('setValue', d.values[c]);
        }
    });
});
