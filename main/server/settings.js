var defaults = [
    {
        key: 'mediadir',
        value: process.env.PWD + '/.uploads',
        description: 'Directory to store uploaded media files.'
    },
        
    {
        key: 'mediaurl',
        value: '/media/static/',
        description: 'URL fragment of media server' // TODO get rid of this, it's not really useful.
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
