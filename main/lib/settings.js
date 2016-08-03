defaults = '{}';

if (Meteor.isServer) {
    defaults = Assets.getText('common/default_settings.json');
    
    Meteor.methods({
        settingsDefaultsJSON: function () {
            return defaults;
        }
    });
} else {
    Meteor.call('settingsDefaultsJSON', (err, res) => {
        defaults = res;
    });
};

combineSettings = function () {
    var out = JSON.parse(defaults);
    
    for (var i in arguments) {
        for (var p in arguments[i]) {
            if (arguments[i].hasOwnProperty(p) && arguments[i][p] !== null && typeof arguments[i][p] !== 'undefined')
                out[p] = arguments[i][p];
        }
    }
    
    return out;
};
