Template.valueSelector.helpers({
    getValue: function () {
        // Probably a 2015 Ugly Javascript Award nominee!
        // Converts float color values to 0-padded hex equivalents
        var toHexColor = function (i) {return ('0' + (i * 255 || 0).toString(16)).slice(-2)};
        var string = '#' + toHexColor(this.value['red']) + toHexColor(this.value['green']) + toHexColor(this.value['blue']);
        return string;
    }
});        
