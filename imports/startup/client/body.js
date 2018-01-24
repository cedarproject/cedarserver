import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import '/imports/lib/bootstrap/js/bootstrap.bundle.min.js';

Meteor.autorun(function () {
    let theme = 'dark';

    let user = Meteor.user();
    if (user && user.theme) {
        theme = user.theme;
    }
    
    if (theme == 'dark') import '/imports/lib/themes/dark.scss';
    else if (theme == 'light') import '/imports/lib/themes/light.scss';
});

import './body.html';
