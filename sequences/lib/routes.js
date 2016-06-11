Router.route('/sequences', {name: 'sequences'});

Router.route('/sequence/:_id', {
    name: 'sequenceSettings',
    waitOn: function () {
        return [
            Meteor.subscribe('sequences'),
            Meteor.subscribe('actions')
        ];
    },
    data: function () {
        return sequences.findOne({_id: this.params._id});
    }
});
