Template.presentationSlideSelector.helpers({
    getPres: function () {
        var pres = Session.get('presentationSlideSelectorPresentation');
        if (!pres) return;
        else return presentations.findOne(pres);
    }
});
