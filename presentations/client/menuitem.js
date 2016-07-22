Template.presentationMenuItem.helpers({
    importstatusIs: function () {
        return Array.from(arguments).indexOf(this.importstatus) != -1;
    }
});
