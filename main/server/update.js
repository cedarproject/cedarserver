// misc updates for when db schema changes, which is currently pretty often

Meteor.startup(function () {
    // make sure stages have layers object
    stages.find({layers: {$exists: false}}).forEach((stage) => {
        var layers = {};
        stage.settings.layers.forEach((layer) => {
            layers[layer] = null;
        });
        
        stages.update(stage, {$set: {layers: layers}});
    });
});
