Template.presentationDisplaySlideImported.helpers({
    isActive: function () {
        var set = Template.parentData(3);
        var action = Template.parentData(2);

        if (set.active == action._id) {
            if (this.order == action.args.order) return 'active';
        }
    }
});
