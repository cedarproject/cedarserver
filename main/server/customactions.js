customactions = new Mongo.Collection('customactions');

Meteor.startup(function () {
    customactions.remove({});
});

Meteor.methods({
    'customActionTriggered': function (action_string) {
        _id = customactions.insert({action_string: action_string});
        
        Meteor.setTimeout(() => {
            customactions.remove(_id);
        }, 1000);
    }
});
