// misc updates for when db schema changes, which is currently pretty often

Meteor.startup(function () {
    // make sure song arrangements have triggers array
    songarrangements.find().forEach(function (arr) {
        if (!arr.triggers) songarrangements.update(arr, {$set: {triggers: []}});
    });
});
