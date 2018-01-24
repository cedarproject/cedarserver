import { Meteor } from 'meteor/meteor';

import './stages';

if (Meteor.isClient) {
    import './dashboard';
}
