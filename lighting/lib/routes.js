Router.route('/lighting', {name: 'lightingMenu'});

Router.route('/lighting/lights', {name: 'lights'});
Router.route('/lighting/light/:_id', {
    name: 'lightSettings',
    data: function () {return lights.findOne({_id: this.params._id});}
});

Router.route('/lighting/groups', {name: 'lightGroups'});
Router.route('/lighting/group/:_id', {
    name: 'lightGroupSettings',
    data: function () {return lightgroups.findOne({_id: this.params._id});}
});

Router.route('/lighting/scenes', {name: 'lightScenes'});
Router.route('/lighting/scene/:_id', {
    name: 'lightSceneSettings',
    data: function () {return lightscenes.findOne({_id: this.params._id});}
});
