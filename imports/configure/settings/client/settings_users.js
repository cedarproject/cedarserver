import { Cedar } from '/imports/lib/connection';
import { Template } from 'meteor/templating';

import './settings_users.html';

Template.settings_users.helpers({
    users() {
        return Meteor.users.find();
    },
    
    userInRole(role) {
        return Roles.userIsInRole(this._id, role);
    },
        
    getPrimaryEmail() {
        return this.emails[0].address;
    }
});
