Template.setAction.helpers({
    actionType: function (type) {
        if (this.type == type) {
            return true;
        } else {
            return false;
        }
    },
    
    getMedia: function () {
        return media.findOne(this.media);
    },
    
    getLightScene: function () {
        return lightscenes.findOne(this.lightscene);
    },   
});
