Router.route('/presentations', {
    name: 'presentationsMenu',
    waitOn: function () {
        return Meteor.subscribe('presentations');
    }
});

Router.route('/presentations/presentation/:_id', {
    name: 'presentationSettings',
    waitOn: function () {
        return [
            Meteor.subscribe('presentations'),
            Meteor.subscribe('presentationslides')
        ];
    },
    data: function () {return presentations.findOne({_id: this.params._id});}
});
