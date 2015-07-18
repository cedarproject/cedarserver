Template.songSection.events({
    'click #content-add': function (event, template) {
        Meteor.call('songSectionAddContent', this._id);
    },
    
    'blur .content-text': function (event, template) {
        var index = template.data.contents.indexOf(this);
        var text = $(event.target).val();
        
        Meteor.call('songSectionChangeContent', template.data._id, index, text);
    }
});
