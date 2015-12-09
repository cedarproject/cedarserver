Template.presentationSlide.helpers({
    imageSelector: {
        collection: media,
        displayTemplate: 'mediaItem',
        fields: [{field: 'title', type: String}, {field: 'tags', type: Array}, {field: 'type', type: String, fixed: 'image'}],
        sort: [['title', 1]],
        addbutton: true
    },
    
    getImage: function () {
        return media.findOne(this.toString());
    },
    
    isSelected: function (k, v) {
        var pres = presentations.findOne(this.presentation);
        if (combineSettings(this.settings, pres.settings)[k] == v) return 'selected';
    }
});

Template.presentationSlide.onRendered(function () {
    this.quill = new Quill(this.$('.slide-editor')[0]);
    this.quill.addFormat('fillin', {tag: 'mark', prepare: 'fillin'});
    this.quill.addModule('toolbar', {container: this.$('.editor-toolbar')[0]});

    this.$('.color').colorpicker({format: 'rgb'}).on('changeColor.colorpicker', (event) => {
        this.quill.focus(); 
        var range = this.quill.getSelection();
        if (range) {
            this.quill.formatText(range.start, range.end, 'color', event.color.toHex());
        }
    });
    
    this.autorun(function () {
        var slide = presentationslides.findOne(this.data._id);
        this.quill.setHTML(slide.content);
    }.bind(this));
});

Template.presentationSlide.events({
    'change .setting': function (event, template) {
        var setting = $(event.target).data('setting');
        Meteor.call('presentationSlideSetting', template.data._id, setting, $(event.target).val());
    },

    'click .fillin': function (event, template) {
        template.quill.focus(); 
        var range = template.quill.getSelection();
        if (range) {
            // Eventually this should use a <mark> tag or <span> with custom class, waiting on Quill update.
            template.quill.formatText(range.start, range.end, 'strike', true);
        }
    },
    
    'click .align': function (event, template) {
        template.quill.focus();
        var range = template.quill.getSelection();
        if (range) {
            template.quill.formatLine(range.start, range.end, 'align', $(event.target).data('value'));
        }
    },
        
    'click .image-add': function (event, template) {
        template.$('.image-modal').modal('show');
    },
    
    'click .collection-add': function (event, template) {
        Meteor.call('presentationSlideImageAdd', template.data._id, $(event.target).data('id'));
        template.$('.image-modal').modal('hide');
    },
    
    'click .image-del': function (event, template) {
        Meteor.call('presentationSlideImageDel', template.data._id, this._id);
    },
    
    'click .modal-close': function (event, template) {
        template.$('.image-modal').modal('hide');
    },

    'blur .slide-editor': function (event, template) {
        Meteor.call('presentationSlideContent', template.data._id, template.quill.getHTML());
    },
    
    'click .slide-settings-toggle': function (event, template) {
        template.$('.slide-settings').first().collapse('toggle');
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
