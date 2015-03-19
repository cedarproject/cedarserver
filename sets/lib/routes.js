Router.route('/sets', {name: 'setsMenu'});
Router.route('/set/:_id', {
    name: 'set',
    data: function () {return sets.findOne(this.params._id);}
});
