Template.colorpicker.onRendered(function () {
    this.firstEventTriggered = false;

    var v = [];
    for (var i in this.data.value) v[i] = Math.round(this.data.value[i] * 255.0);

    if (v.length == 3) var c = `rgb(${v.join(',')})`;
    else var c = `rgba(${v.join(',')})`;
    
    var picker = this.$('div').colorpicker({
        format: this.data['format'],
        inline: true,
        container: true
    }).colorpicker('setValue', c);
    
    for (var prop in this.data) {
        if (prop.startsWith('data-')) {
            picker.data(prop.slice(5), this.data[prop]);
        }
    }
});

Template.colorpicker.events({
    'colorChange': function (event, template) {
        if (!this.firstEventTriggered) {
            // Prevent event from firing on colorpicker init.
            event.stopImmediatePropagation();
            this.firstEventTriggered = true;
        }
    }
});
