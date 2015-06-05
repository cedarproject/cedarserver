Template.media.helpers({
    media: function () {
        return media.find({}, {sort: [['new', 'desc'], ['title', 'asc']]});
    }
});
