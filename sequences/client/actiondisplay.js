Template.sequenceActionDisplay.helpers({
    isActive: function () {
        if (this._id == Session.get('sequence-active')) return 'active';
    }
});
