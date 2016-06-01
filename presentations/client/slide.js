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
    }
});

Template.presentationSlide.onRendered(function () {
    this.editor = CodeMirror(this.$('.editor-container')[0], {
        mode: 'gfm',
        theme: 'cedar',
        lineNumbers: false,
        lineWrapping: true,
        pollInterval: 500,
        workTime: 100,
        workDelay: 500
    });        

    this.autorun(function () {
        var content = presentationslides.findOne(Template.currentData()._id).content;
        Template.instance().editor.setValue(content);
    });
});
        

Template.presentationSlide.events({
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
        if (!template.editor.hasFocus()) template.editor.focus();
        var type = $(event.target).data('type');
        
        if (type == 'bold') var wrap = '**';
        else if (type == 'italic') var wrap = '_';
        else if (type == 'underline') var wrap = '~~';
        else if (type == 'fillin') var wrap = '`';
        
        var selection = template.editor.getSelection();
        template.editor.replaceSelection(wrap + selection + wrap, 'around');
    },
    
    'mousedown .edit-line-btn': function (event, template) {
        if (!template.editor.hasFocus()) template.editor.focus();

        var type = $(event.target).data('type');

        if (type == 'h1') var pre = '# ';
        else if (type == 'h2') var pre = '## ';
        else if (type == 'h3') var pre = '### ';
        else if (type == 'ul') var pre = '* ';

        var selection = template.editor.listSelections()[0];
        var start = Math.min(selection.anchor.line, selection.head.line);
        var end = Math.max(selection.anchor.line, selection.head.line) + 1;
        
        var edited = '';
        var lastLength = null;

        if (type == 'ol') {
            if (start > 0) {
                var prev = template.editor.getLine(start - 1);
                var n = parseInt(prev.split('. ')[0]);
                if (!isNaN(n)) var pre_n = n + 1;
                else var pre_n = 1;
                
            } else var pre_n = 1;
        }
        // TODO finish CSS classes styling, add per-pres and per-slide colorings, edit CSS classes from JS for colors, etc.
        
        for (var i = start; i < end; i++) {
            var line = template.editor.getLine(i);

            if (type == 'ol') {
                var s = line.split('. ');
                if (!isNaN(parseInt(s[0]))) line = s.slice(1).join('. ');
            
                var pre = pre_n + '. ';
                pre_n++;
            }

            edited += pre + line + '\n';
        }
                
        template.editor.setSelection({line: start, ch: 0}, {line: end, ch: 0});
        template.editor.replaceSelection(edited, 'around');
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

    'blur .CodeMirror': function (event, template) {
        Meteor.call('presentationSlideContent', template.data._id, template.editor.getValue());
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
