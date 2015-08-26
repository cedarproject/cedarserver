Template.layout.helpers({
    notFullscreen: function () {
        var curr = Router.current().lookupTemplate();
        if (curr == 'Webminionmedia') return false;
        else return true;
    },

    isActive: function (section) {
        var current = Router.current().lookupTemplate();
        if (current.toLowerCase().startsWith(section)) return 'active';
    }
});
