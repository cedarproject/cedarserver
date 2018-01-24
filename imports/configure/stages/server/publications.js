import { Meteor } from 'meteor/meteor';
import { is_viewer } from '/imports/lib/accounts/role_helpers.js';
import { Stages } from '../collections.js';

Meteor.publish('stages.all', function () {
    if (is_viewer(this)) return Stages.find();
});

Meteor.publish('stages.one', function (stage_id) {
    if (is_viewer(this)) return Stages.find({_id: stage_id});
});
