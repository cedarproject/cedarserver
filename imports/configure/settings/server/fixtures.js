import { Settings } from '../collections.js';

// Field `pub` determines if document is sent to clients, can be 'all', a user role, or `server` for server-only
// Field `edit` sets which user role can edit the document, or `server` for server-only

let fixtures = [
// Core settings
{
    _id: 'settings_fixtures_inserted',
    value: true,
    pub: 'server',
    change: 'server'
}
];

Meteor.startup(function () {
    Settings.insert(fixtures, () => {});
});
