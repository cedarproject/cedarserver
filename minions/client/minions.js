Template.minionsList.helpers({
    minions: function () {
        return minions.find({stage: this._id || null});
    }
});
