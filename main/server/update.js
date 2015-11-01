// misc updates for when db schema changes, which is currently pretty often

Meteor.startup(function () {
    // make sure song arrangements have triggers array
    songarrangements.update({triggers: {$exists: false}}, {$set: {triggers: []}}, {multi: true});
    
    // make sure actions have triggers setting set
    actions.update({'settings.triggers': {$exists: false}}, {$set: {'settings.triggers': true}}, {multi: true});
});
