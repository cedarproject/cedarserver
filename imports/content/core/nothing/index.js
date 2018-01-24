import { Meteor } from 'meteor/meteor';
import { ActionTypes } from '/imports/lib/actions/register.js';

// TODO this should be an object that gets instantiated and modified
let type = {
    type_id: 'core.nothing',
    type_name: 'Nothing',
    create(base_action) {
        return base_action;
    },
    activate(action) {
        return;
    },
    get_content_query(action) {
        return;
    }
}

if (Meteor.isClient) {
    import { Template } from 'meteor/templating';

    import './controls.html';
    import './header.html';
    import './settings.html';

    type.templates = {
        controls: Template.content_core_nothing_controls,
        header: Template.content_core_nothing_header,
        settings: Template.content_core_nothing_settings
    };
}

ActionTypes.register(type);
