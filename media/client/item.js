Template.mediaItem.helpers({
    typeIs: function () {
        for (var arg in arguments) {
            if (arguments[arg] == this.type) return true;
        }
    },

    getLength: function () {
        return secondsToTimeString(parseFloat(this.duration));
    }
});
