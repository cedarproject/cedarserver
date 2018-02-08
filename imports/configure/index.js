import { Meteor } from 'meteor/meteor';

import './settings';
import './stages';

if (Meteor.isClient) {
    import './dashboard';
}
