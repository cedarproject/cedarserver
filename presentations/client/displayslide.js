Template.presentationDisplaySlide.helpers({
    isActive: function () {
        var set = Template.parentData(3);
        var action = Template.parentData(2);

        if (set.active == action._id) {
            if (this.order == action.args.order) return 'active';
        }
    },
    
    getMedia: function () {
        return media.findOne(this.toString());
    },
    
    backgroundColor: function () {
        var pres = presentations.findOne(this.presentation);
        var color = combineSettings(pres.settings, this.settings).presentations_background_color;
        return `rgb(${Math.round(color[0] * 255.0)}, ${Math.round(color[1] * 255.0)}, ${Math.round(color[2] * 255.0)})`;
    },

    fontColor: function () {
        var pres = presentations.findOne(this.presentation);
        var color = combineSettings(pres.settings, this.settings).presentations_font_color;
        return `rgb(${Math.round(color[0] * 255.0)}, ${Math.round(color[1] * 255.0)}, ${Math.round(color[2] * 255.0)})`;
    },

    fillins: function () {
        var tags = 1;
        var numbers = [{action: this.action, order: this.order, fillin: 0}];

        var cont = false;

        this.content.ops.forEach((section, i) => {
            if (section['attributes'] && section['attributes']['strike']) {
                if (!cont) {
                    numbers.push({action: this.action, order: this.order, fillin: tags++});
                    cont = true;
                }
            } else {
                cont = false;
            }
        });
        
        if (numbers.length > 1) return numbers;
    },
    
    fillinActive: function () {
        var set = Template.parentData(4);
        var action = Template.parentData(3);
        
        if (set.active == action._id) {
            if (this.order == action.args.order && this.fillin == action.args.fillin) return 'active';
        }
    }
});


Template.presentationDisplaySlide.onRendered(function () {
    this.quill = new Quill(this.$('.display-container')[0], {
        readOnly: true
    });

    this.autorun(function () {
        var content = presentationslides.findOne(Template.currentData()._id).content;
        Template.instance().quill.setContents(content);
    });
});
