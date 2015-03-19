Template.actionSelector.helpers({
    filteredMedia: function () {
        if (!this.mediafilter) {
            this.mediafilter = {
                tag: new ReactiveVar(new RegExp('', 'i')),
                title: new ReactiveVar(new RegExp('', 'i'))
            };
        }

        return media.find({
            title: this.mediafilter.title.get(),
        });
    }
});

Template.actionSelector.events({
    'keyup .action-selector-media-title': function (event) {
        console.log($(event.target).val());
        this.mediafilter.title.set(new RegExp($(event.target).val(), 'i'));
    },
    
    'keypress .action-selector-media-tag': function (event) {
        this.mediafilter.tag.set(new RegExp($(event.target).val(), 'i'));
    },
    
    'click .action-selector-cancel': function (event) {
        $(event.target).parents('.modal').modal('hide');
    }
});
