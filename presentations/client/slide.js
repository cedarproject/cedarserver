Template.presentationSlide.helpers({
    getImage: function () {
        return media.findOne(this.toString());
    },
    
    isSelected: function (k, v) {
        var pres = presentations.findOne(this.presentation);
        if (combineSettings(this.settings, pres.settings)[k] == v) return 'selected';
    },

    getSetting: function (setting) {
        var pres = presentations.findOne(this.presentation);
        return combineSettings(this.settings, pres.settings)[setting];
    },
    
    getRecentColor: function () {
        return Session.get('pres-recent-color');
    }
});

Template.presentationSlide.onRendered(function () {
    this.editor = new Quill(this.$('.editor-container')[0], {});

    this.autorun(function () {
        var content = presentationslides.findOne(Template.currentData()._id).content;
        Template.instance().editor.setContents(content);
    });
    
    // TODO implement most-recently-used color saving
    this.initialEvent = false;
    this.colorpicker = this.$('.edit-color').colorpicker({format: 'hex'});
    
    if (!Session.get('pres-recent-color')) Session.set('pres-recent-color', 'black');
});
        

Template.presentationSlide.events({
    'click .edit-save': function (event, template) {
        // Save manually until I can figure out how to catch blur event TODO.
        Meteor.call('presentationSlideContent', template.data._id, template.editor.getContents());        
    },
    
    'change .setting': function (event, template) {
        event.stopImmediatePropagation()
        var setting = $(event.target).data('setting');
        var value = $(event.target).val();
        if (value == '') value = null;
        Meteor.call('presentationSlideSetting', template.data._id, setting, value);
    },
    
    'changeColor .setting': function (event, template) {
        event.stopImmediatePropagation()
        var setting = $(event.target).data('setting');
        
        var c = event.color.toRGB();
        if ($(event.target).data('colorpicker').options.format == 'rgba') {
            var value = [c.r / 255.0, c.g / 255.0, c.b / 255.0, c.a];
        } else {
            var value = [c.r / 255.0, c.g / 255.0, c.b / 255.0];
        }

        Meteor.call('presentationSlideSetting', template.data._id, setting, value);
    },

    'click .setting-reset': function (event, template) {
        var setting = $(event.target).data('setting');
        Meteor.call('presentationSlideSetting', template.data._id, setting, null);
    },

    'mousedown .edit-span-btn': function (event, template) {
        template.editor.focus();
        var type = $(event.target).data('type');
        var current = template.editor.getFormat();
        
        if (current[type]) template.editor.format(type, false);
        else template.editor.format(type, true);
    },
    
    'change .edit-size': function (event, template) {
        template.editor.focus();
        var size = $(event.target).val();        
        template.editor.format('size', size);
    },
    
    'changeColor .edit-color': function (event, template) {
        if (!template.initialEvent) template.initialEvent = true;
        else {
            template.editor.focus();
            var color = event.color.toHex();
            
            Session.set('pres-recent-color', color);
            template.editor.format('color', color);
        }
    },
    
    'click .edit-color-recent': function (event, template) {
        template.editor.focus();
        template.editor.format('color', Session.get('pres-recent-color'));
    },
    
    'mousedown .edit-line-btn': function (event, template) {
        template.editor.focus();
        var type = $(event.target).data('type');
        var value = $(event.target).data('value');
        var selection = template.editor.getSelection();
        
        template.editor.formatLine(selection.index, selection.length, type, value);
    },
      
    'click .image-add': function (event, template) {
        Session.set('add-to', template.data._id);
        $('.image-modal').modal('show');
    },
    
    'click .image-del': function (event, template) {
        Meteor.call('presentationSlideImageDel', template.data._id, this._id);
    },
    
    'click .modal-close': function (event, template) {
        template.$('.image-modal').modal('hide');
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
