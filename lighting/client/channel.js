Template.lightChannel.helpers({
    typeIs: function (type) {
        if (this.type == type) return true;
    },

    types: function () {
        var types = [
            'red',
            'green',
            'blue',
            'intensity',
            'fixed'
        ];
        
        for (var i in types) {
            types[i] = {type: types[i], selected: false};
            if (this.type == types[i].type) types[i].selected = true;
        }
        
        return types;
    }
});
