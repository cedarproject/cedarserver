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
    this.sliders = [];
    this.$('.light-slider').each((i, e) => {
        this.sliders.push(new Slider(e, {max: 1, step: 0.01, tooltip: 'hide'}));
    });
    
    this.autorun(() => {
        var d = Template.currentData()
        for (var c in d.channels) {
            this.sliders[c].setValue(d.values[c]);
        }
    });
});
