Meteor.publish('songs', function () {
    return songs.find();
});

Meteor.publish('songsections', function () {
    return songsections.find();
});

Meteor.publish('songarrangements', function () {
    return songarrangements.find();
});
