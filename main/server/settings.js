var defaults = [
    {
        key: 'mediadir',
        value: process.env.PWD + '/.uploads/',
        description: 'Directory to store uploaded media files.'
    },
    {
        key: 'mediainternalserver',
        value: true,
        description: 'Whether Cedar serves media files itself or uses an external server'
    },
    {
        key: 'mediaurl',
        value: '/media/static/',
        description: 'URL prefix of media server'
    }
];

Meteor.startup(function () {
    defaults.forEach(function (setting, index, defaults) {
        if (settings.findOne({key: setting.key}) === undefined) {
            settings.insert(setting);
        }
    });
});
