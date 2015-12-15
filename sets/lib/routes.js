Router.route('/sets', {
    name: 'setsMenu',
    waitOn: function () {
        return Meteor.subscribe('sets');
    }
});

Router.route('/set/:_id', {
    name: 'set',
    waitOn: function () {
        return [
            Meteor.subscribe('sets'),
            Meteor.subscribe('actions'),
            Meteor.subscribe('media'),
            Meteor.subscribe('songs'),
            Meteor.subscribe('presentations'),
            Meteor.subscribe('lightscenes')
        ];
    },
    data: function () {return sets.findOne(this.params._id);}
});
