import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { is_admin } from '/imports/lib/accounts/role_helpers.js';

Meteor.methods({
    'user.theme'(user_id, theme) {
        if (user_id != this.userId) is_admin(this);
        
        Meteor.users.update(user_id, {$set: {theme: theme}});
    },
    
    'user.reset_password'(user_id) {
        if (user_id != this.userId) is_admin(this);
        
        Accounts.sendResetPasswordEmail(user_id);
    },
    
    'user.delete'(user_id) {
        if (user_id != this.userId) is_admin(this);
        
        Meteor.users.remove({_id: user_id});
    },
    
    'user.add_role'(user_id, role) {
        is_admin(this);
        
        let roles = [role];

        if (role == 'editor' || role == 'controller')
            roles.push('viewer');
        else if (role == 'admin')
            roles = ['viewer', 'editor', 'controller', role];
        
        Roles.addUsersToRoles(user_id, roles);
    },
    
    'user.remove_role'(user_id, role) {
        is_admin(this);
        
        let roles = [role];
        
        if (role == 'editor' || role == 'controller')
            roles.push('admin');
        else if (role == 'viewer')
            roles = [role, 'controller', 'editor', 'admin'];
            
        Roles.removeUsersFromRoles(user_id, roles);
    }        
});
