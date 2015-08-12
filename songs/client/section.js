Template.songSection.events({
    'click .section-title': function (event, template) {
        template.$('.section-title').addClass('hidden');
        template.$('.section-title-edit').removeClass('hidden');
    },
    
    'blur .section-title-edit': function (event, template) {
        Meteor.call('songSectionTitle', this._id, template.$('.section-title-edit').val());
        template.$('.section-title-edit').addClass('hidden');
        template.$('.section-title').removeClass('hidden');
    },
    
    'click #content-add': function (event, template) {
        Meteor.call('songSectionAddContent', this._id);
    },
    
    'click .content-del': function (event, template) {
        Meteor.call('songSectionDelContent', template.data._id, template.data.contents.indexOf(this));
    },
    
    'blur .content-text': function (event, template) {
        var index = template.data.contents.indexOf(this);
        var text = $(event.target).val();
        
        Meteor.call('songSectionChangeContent', template.data._id, index, text);
    }
});
