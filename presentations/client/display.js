Template.presentationDisplay.helpers({
    slides: function () {
        var slides = [];
        presentationslides.find({presentation: this._id}, {sort: [['order', 'asc']]}).forEach(function (slide) {
            slide.action = this.action;
            slides.push(slide);
        }.bind(this));
        
        return slides;
    },
    
    renderContent: function () {
        var md = new Remarkable();
        return md.render(this.content);
    },
    
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
    
    fillins: function () {
        var tags = this.content.match(/`/g);
        
        if (tags) {
            var numbers = [];
            for (var i = 0; i <= tags.length / 2; i++) numbers.push({action: this.action, order: this.order, fillin: i});
            return numbers;
        }
    },
    
    fillinActive: function () {
        var set = Template.parentData(4);
        var action = Template.parentData(3);
        
        if (set.active == action._id) {
            if (this.order == action.args.order && this.fillin == action.args.fillin) return 'active';
        }
    }
});
