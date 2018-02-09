import { Meteor } from 'meteor/meteor';

Accounts.onCreateUser(function (options, user) {
    // If this is the first user to be created, make it an admin
    if (Meteor.users.find().count() == 0) {
        user.roles = ['viewer', 'controller', 'editor', 'admin'];
    }
    
    // Defauting to light theme, even though dark theme is cooler.
    user.theme = 'light';
    
    // 'Cause the Meteor Guide says to. 
    if (options.profile) {
        user.profile = options.profile
    }
    
    return user;
});
