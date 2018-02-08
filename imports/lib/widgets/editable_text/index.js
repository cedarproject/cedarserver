import { Template } from 'meteor/templating';

import './editable_text.html';

let toggle = function (template, val) {
    template.$('.editable-text-p').attr('hidden', val);
    template.$('.editable-text-input').attr('hidden', !val);
};

let send = function (template) {
    let val = template.$('.editable-text-input').val()
    let e = new CustomEvent('edited', {detail: val});
    template.$('.editable-text-p').parent()[0].dispatchEvent(e);
}


Template.editable_text.events({
    'click .editable-text-p'(event, template) {
        toggle(template, true);
        template.$('.editable-text-input').focus();
    },
    'blur .editable-text-input'(event, template) {
        toggle(template, false);
        send(template);
    },
    'keydown .editable-text-input'(event, template) {
        if (event.which == 13) { // Enter key
            toggle(template, false);
            send(template);
        }
    }
});
