import { Meteor } from 'meteor/meteor';

import { is_admin } from '/imports/lib/accounts/role_helpers.js';

Meteor.methods({
    'user.theme'(user_id, theme) {
        if (user_id != this.userId) is_admin(this);
        
        Meteor.users.update(user_id, {$set: {theme: theme}});
    }
});
