// TODO The sliders currently don't react to changes from other clients, fix!
var toHexColor = function (i) {return ('0' + (i * 255 || 0).toString(16)).slice(-2)};

Template.valueSelector.helpers({
    channels: function () {
        var channels = [];
        
        for (var c in this.value) {
            if (this.value.hasOwnProperty(c)) {
                channels.push({
                    channel: c,
                    value: this.value[c]
                });
            }
        }
        
        return channels;
    },
    
    hasColor: function () {
        if (typeof this.value['red'] !== 'undefined' ||
            typeof this.value['green'] !== 'undefined' ||
            typeof this.value['blue'] !== 'undefined') return true;
    },
    
    getColor: function () {
        var string = '#' + toHexColor(this.value['red']) + toHexColor(this.value['green']) + toHexColor(this.value['blue']);
        return string;
    }
});

Template.valueSelector.onRendered(function () {
    this.$('.value-slider').slider({max: 1, step: 0.01, tooltip: 'hide'});
});
