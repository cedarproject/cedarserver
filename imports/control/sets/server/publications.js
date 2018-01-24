import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { is_viewer } from '/imports/lib/accounts/role_helpers.js';
import '../collections.js';

// For requested stage, get up to 10 upcoming sets sorted by date, plus all pinned sets for stage
Meteor.publish('sets.upcoming', function (stage) {
    is_viewer(this);

    let now = new Date();
    return Sets.find(
        {stage: stage, $or: [{pinned: true}, {dates: {$gte: now}}]},
        {sort: [['pinned', 'asc'], ['date', 'asc'], ['title', 'asc']], limit: 10}
    );
});

// Gets a single set
Meteor.publish('sets.single', function (set) {
    is_viewer(this);

    return Sets.find({_id: set});
});
