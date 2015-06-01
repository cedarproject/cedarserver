Template.layout.helpers({
    notFullscreen: function () {
        if (Router.current().lookupTemplate() == 'Webminionmedia') return false;
        else return true;
    },

    isActive: function (section) {
        var current = Router.current().lookupTemplate();
        if (current.toLowerCase().startsWith(section)) return 'active';
    }
});
