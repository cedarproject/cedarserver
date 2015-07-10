var toHexColor = function (i) {return ('0' + (i * 255 || 0).toString(16)).slice(-2)};

Template.valueSelector.helpers({
    channels: function () {
        return this.channels;
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
        var string = '#' + toHexColor(this.values['red']) + toHexColor(this.values['green']) + toHexColor(this.values['blue']);
        return string;
    },
    
    getIndex: function () {
        return Template.parentData().channels.indexOf(this);
    }
});

Template.valueSelector.onRendered(function () {
    this.$('.value-slider').slider({max: 1, step: 0.01, tooltip: 'hide'});
    
    this.autorun(function () {
        var values = Template.currentData().values;
        for (channel in values) {
            if (values.hasOwnProperty(channel)) {
                Template.instance().$('#' + channel).slider('setValue', values[channel]);
            }
        }
    });
});
