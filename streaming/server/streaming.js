kurento = null;
pipeline = null;
create = null;
sources = {};
viewers = {};

Meteor.methods({
    streamingConnected: function () {
        if (kurento !== null) return true;
        else return false;
    },
        
    streamingConnect: function () {
        var url = settings.findOne({key: 'streamingserver'}).value;
        if (!url) return false;
        
        kurento = new KurentoClient.KurentoClient(url, (err, kurento) => {
            if (err) {console.log('error connecting to kurento server:', err); return;}
            kurento.create('MediaPipeline', (err, _pipeline) => {
                if (err) {console.log('error creating kurento pipeline:', err); return;}
                console.log('connected to kurento server');
                pipeline = _pipeline;
                create = Meteor.wrapAsync(pipeline.create, this);
            });
        });
    },
    
    streamingDebug: function () {
        if (!pipeline) throw new Meteor.Error('no-pipeline', 'No pipeline to debug!');
        var fs = Npm.require('fs');
        var child_process = Npm.require('child_process');

        pipeline.getGstreamerDot('SHOW_ALL', (err, res) => {
            fs.writeFileSync('/tmp/cedar-kurento-debug.dot', res);
            child_process.exec('dot -Tsvg -O /tmp/cedar-kurento-debug.dot');
        });        
    }
});
