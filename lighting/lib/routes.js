Router.route('/lighting', {name: 'lightingMenu'});

Router.route('/lighting/lights', {name: 'lights'});
Router.route('/lighting/light/:_id', {
    name: 'lightSettings',
    data: function () {return lights.findOne({_id: this.params._id});}
});

Router.route('/lighting/groups', {name: 'lightGroups'});
Router.route('/lighting/group/:_id', {
    name: 'lightGroup',
    data: function () {return lightgroups.findOne({_id: this.params._id});}
});
