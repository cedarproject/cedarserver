Template.mediaPlaylistSettings.helpers({
    mediaSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}],
        sort: [['title', 'asc']],
        addbutton: true
    },
    
    getContents: function () {
        var out = [];
        for (var i in this.contents) {
            var m = media.findOne(this.contents[i]);
            m.index = parseInt(i);
            out.push(m)
        }
       
        return out;
    }
});

Template.mediaPlaylistSettings.events({
    'click #settings-toggle': function (event, template) {
        template.$('#settings-pane').collapse('toggle');
    },
    
    'click #delete': function (event, template) {
        Meteor.call('playlistDel', template.data._id);
        Router.go('/media/playlists');
    },
    
    'blur #title': function (event, template) {
        Meteor.call('playlistTitle', template.data._id, $(event.target).val());
    },
    
    'click #add-item': function (event, template) {
        template.$('#media-modal').modal('show');
    },
    
    'click .collection-add': function (event, template) {
        var contents = template.data.contents;
        contents.push($(event.target).data('id'));
        Meteor.call('playlistContents', template.data._id, contents);
    },
    
    'click .item-down': function (event, template) {
        var contents = template.data.contents;
        if (this.index < contents.length-1) { // TODO figure out why this shoves stuff to the bottom of the list!
            contents.splice(this.index+1, 0, contents.splice(this.index, 1)[0]);
            Meteor.call('playlistContents', template.data._id, contents);
        }
    },

    'click .item-up': function (event, template) {
        var contents = template.data.contents;
        if (this.index > 0) {
            contents.splice(this.index-1, 0, contents.splice(this.index, 1)[0]);
            Meteor.call('playlistContents', template.data._id, contents);
        }
    },
    
    'click .item-del': function (event, template) {
        var contents = template.data.contents;
        contents.splice(this.index, 1);
        Meteor.call('playlistContents', template.data._id, contents);
    },
});
