import { Meteor } from 'meteor/meteor';

if (Meteor.isClient) {
    import './client';
} else {
    import './server';
}
