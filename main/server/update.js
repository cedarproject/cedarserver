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
    
    // make sure stages have sequences object
    stages.update({sequences: {$exists: false}}, {$set: {sequences: {}}}, {multi: true});
    
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
    
    // ensure all presentations have settings object
    presentations.update({settings: {$exists: false}}, {$set: {settings: {}}}, {multi: true});
    
    // ensure all presentations have imported property
    presentations.update({imported: {$exists: false}}, {$set: {imported: false}}, {multi: true});
});
