import { Template } from 'meteor/templating';

import './backbutton.html';

Template.backbutton.events({
    'click .backbutton'(event, template) {
        history.back(-1);
    }
});
