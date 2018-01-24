import { Template } from 'meteor/templating';

import './layout.html';

Template.layout.helpers({
    userPrimaryEmail() {
        return Meteor.user().emails[0].address;
    },
    themeIs(theme) {
        return Meteor.user().theme == theme;
    }
});

Template.layout.events({
    'click #logout-user'(event, template) {
        AccountsTemplates.logout();
    },
    
    'click #switch-theme'(event, template) {
        let user = Meteor.user();
        let theme = 'dark';
        if (user.theme == 'dark') theme = 'light';
        
        Meteor.call('user.theme', user._id, theme);
        window.location.reload();
    }
});
