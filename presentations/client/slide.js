Template.presentationSlide.onRendered(function () {
    this.quill = new Quill(this.$('.slide-editor')[0]);
    this.quill.addModule('toolbar', {container: this.$('.editor-toolbar')[0]});
    
    this.autorun(function () {
        var slide = presentationslides.findOne(this.data._id);
        this.quill.setHTML(slide.content);
    }.bind(this));
});

Template.presentationSlide.events({
    'click .size': function (event, template) {
        var select = template.$('.ql-size').val($(event.target).data('value'))[0];

        // Can't use jQuery events because Quill uses native events.
        var event = document.createEvent("HTMLEvents");
        event.initEvent("change", true, true);
        event.eventName = 'change';
        select.dispatchEvent(event);
    },

    'blur .slide-editor': function (event, template) {
        Meteor.call('presentationSlideContent', template.data._id, template.quill.getHTML());
    },
    
    'click .slide-down': function (event, template) {
        Meteor.call('presentationSlideMove', template.data._id, template.data.order + 1);
    },

    'click .slide-up': function (event, template) {
        Meteor.call('presentationSlideMove', template.data._id, template.data.order - 1);
    },
    
    'click .slide-del': function (event, template) {
        Meteor.call('presentationSlideDel', template.data._id);
    }
});
