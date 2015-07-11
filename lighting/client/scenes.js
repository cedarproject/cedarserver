Template.lightScenes.helpers({
    scenes: function () {
        return lightscenes.find();
    }
});

Template.lightScenes.events({
    'click .scene-add': function (event) {
        Meteor.call('sceneAdd');
    },
    
    'click .scene-clone': function (event, template) {
        Meteor.call('sceneClone', this._id);
    }
});
