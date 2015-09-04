Template.lightScenes.helpers({
    scenes: function () {
        return lightscenes.find();
    },
    
    sceneSelector: {
        collection: lightscenes,
        displayTemplate: 'lightscenesListItem',
        fields: [{field: 'title', type: String}, {field: 'stage', type: Stage}],
        sort: [['title', 1]],
        addbutton: false
    },
});

Template.lightScenes.events({
    'click .scene-add': function (event) {
        Meteor.call('sceneAdd', function (err, val) {
            if (!err) Router.go('/lighting/scene/' + val);
        });
    },
    
    'click .scene-clone': function (event, template) {
        Meteor.call('sceneClone', this._id, function (err, val) {
            if (!err) Router.go('/lighting/scene/' + val);
        });
    }
});
