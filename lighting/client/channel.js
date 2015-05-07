Template.lightChannel.helpers({
    types: function () {
        var types = [
            'red',
            'green',
            'blue',
            'intensity'
        ];
        
        for (var i in types) {
            types[i] = {type: types[i], selected: false};
            if (this.type == types[i].type) types[i].selected = true;
        }
        
        return types;
    }
});
