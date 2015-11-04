Router.route('/minions', {name: 'minionsMenu'});

Router.route('/stages/settings/:_id', {
    name: 'stageSettings',
    data: function () {return stages.findOne({_id: this.params._id});}
});

Router.route('/minions/settings/:_id', {
    name: 'minionsettings',
    data: function () {return minions.findOne({_id: this.params._id});}
});

Router.route('/minions/web/media/:_id', {
    name: 'webminionmedia',
    waitOn: function () {
        return [Meteor.subscribe('minions'),
                Meteor.subscribe('stages'),
                Meteor.subscribe('media'),
                Meteor.subscribe('songs'),
                Meteor.subscribe('presentations')];
    },
    data: function () {return minions.findOne(this.params._id);}
});
