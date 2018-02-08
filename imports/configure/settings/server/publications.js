import { Meteor } from 'meteor/meteor';
import { Settings } from '../collections.js';

function get_pub (userId) {
    let pub = [];
    if (this.userId) {
        pub = Roles.getRolesForUser(this.userId);
    }
    
    pub.push('all');
    return pub;
};

Meteor.publish('settings.all', function () {    
    return Settings.find({pub: {$in: get_pub(this.userId)}});
});

Meteor.publish('settings.some', function (settings) {
    return Settings.find({
        _id: {$in: settings},
        pub: {$in: get_pub(this.userId)}
    });
});
