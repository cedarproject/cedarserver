import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
    import './server';
} else {
    import './client';
}
