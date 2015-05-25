Template.lightScenes.helpers({
    scenes: function () {
        return lightscenes.find();
    }
});

Template.lightScenes.events({
    'click .scene-add': function (event) {
        Meteor.call('sceneAdd');
    }
});
