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
    
    // change layers from object to array
    minions.find({type: 'media'}).forEach((minion) => {
        if (minion.layers.__proto__ !== Array.prototype) {
            var layers = [];
            for (var l in minion.layers) {
                if (minion.layers.hasOwnProperty(l)) layers.push(l);
            }
            
            minions.update(minion, {$set: {layers: layers}});
        }
    });
    
    // move name variable to title
    minions.find({name: {$exists: true}}).forEach((minion) => {
        minions.update(minion, {$set: {title: minion.name}, $unset: {name: null}});
    });
});
