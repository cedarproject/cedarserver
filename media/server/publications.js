Meteor.publish('media', function () {
    return media.find();
});

Meteor.publish('mediaplaylists', function () {
    return mediaplaylists.find();
});
