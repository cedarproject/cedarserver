Template.minionSettingsPresentations.helpers({
    getSetting: function (setting) {
        return combineSettings(this.settings)[setting];
    },
    
    isSelected: function (setting, value) {
        if (combineSettings(this.settings)[setting] == value) return 'selected';
    }
});
