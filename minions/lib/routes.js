Router.route('/minions', {name: 'minionsMenu'});
Router.route('/minions/web/media/:_id', {
    name: 'webminionmedia',
    data: function () {return this.params._id;}
});
