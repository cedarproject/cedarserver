Template.actionDisplay.helpers({
    actionType: function (type) {
        return this.type == type
    },
    
    getMedia: function () {
        return media.findOne(this.media);
    },
    
    getPlaylist: function () {
        return mediaplaylists.findOne(this.playlist);
    },
    
    getLight: function () {
        return lights.findOne(this.light);
    },
    
    getLightGroup: function () {
        return lightgroups.findOne(this.lightgroup);
    },
    
    getLightScene: function () {
        return lightscenes.findOne(this.lightscene);
    },
    
    getSong: function () {
        var song = songs.findOne(this.song);
        song.arrangement = songarrangements.findOne(this.settings.arrangement);
        song.action = this._id;
        return song;
    },
    
    getPresentation: function () {
        var pres = presentations.findOne(this.presentation);
        pres.action = this._id;
        return pres;
    },
    
    getPresentationSlide: function () {
        var slides = presentationslides.findOne(this.presentationslide);
        slide.action = this._id;
        return slide;
    },
    
    getSequence: function () {
        return sequences.findOne(this.sequence);
    },
});
