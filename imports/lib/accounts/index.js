import { Meteor } from 'meteor/meteor';

import './accounts_config.js';

if (Meteor.isClient) {
    import './client';
} else {
    import './server';
}
