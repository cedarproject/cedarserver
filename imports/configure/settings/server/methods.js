import { Meteor } from 'meteor/meteor';
import { Settings } from '../collections.js';

function has_permission(userId, setting_id) {
    if (context.connection !== null) {
        let setting = Settings.findOne(setting_id);
        if (!Roles.userIsInRole(this.userId, [setting.edit]))
            throw new Meteor.Error('not-authorized', `User must be in role "${setting.edit}" to modify setting "${setting_id}"`);
    }
}

Meteor.methods({
    'settings.set_value'(setting_id, value) {
        has_permission(this.userId, setting_id);
        
        Settings.update(setting, {$set: {value: value}});
    },
    
    'settings.modify'(setting_id, modifier) {
        has_permission(this.userId, setting_id);
        
        Settings.update(setting, modifier);
    }
});
