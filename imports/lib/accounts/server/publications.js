import { Meteor } from 'meteor/meteor';
import { is_admin } from '../role_helpers.js';

Meteor.publish(null, function () {
    return Meteor.users.find({_id: this.userId}, {fields: {services: 0}});
});

Meteor.publish('users.all', function () {
    if (is_admin(this)) return Meteor.users.find({}, {fields: {services: 0}});
});

Meteor.publish('users.one', function (userId) {
    if (userId == this.userId || is_admin(this))
        return Meteor.users.find({}, {fields: {services: 0}});
});
