Template.stagesList.helpers({
    stages: function () {
        return stages.find();
    }
});

Template.stagesList.events({
    'click .stages-new': function (event) {
        Meteor.call('stageNew');
    },
    
    'click .web-minion-new': function (event) {
        Meteor.call('minionNew', 'media');
    },
});
