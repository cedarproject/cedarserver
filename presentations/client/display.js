Template.presentationDisplay.helpers({
    slides: function () {
        var slides = [];
        presentationslides.find({presentation: this._id}, {sort: [['order', 'asc']]}).forEach(function (slide) {
            slide.action = this.action;
            slides.push(slide);
        }.bind(this));
        
        return slides;
    }
});
