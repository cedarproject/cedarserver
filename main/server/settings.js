var defaults = [
    {
        key: 'mediadir',
        value: process.env.PWD + '/.uploads',
        description: 'Directory to store uploaded media files.'
    },
        
    {
        key: 'streamingserver',
        value: null,
        description: 'URL of Kurento server'
    }
];

Meteor.startup(function () {
    defaults.forEach(function (setting, index, defaults) {
        if (settings.findOne({key: setting.key}) === undefined) {
            settings.insert(setting);
        }
    });
});

Meteor.methods({
    mainSetting: function (key, value) {
        settings.update({key: key}, {$set: {value: value}});
    }
});
