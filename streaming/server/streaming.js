kurento = null;
pipeline = null;
create = null;
sources = {};
viewers = {};

// There are three hard things in computer science: naming stuff, and off-by-one errors.
class StreamingStuff {
    constructor () {
        this.element = null;
        this.candidates = [];
    }
};
        

Meteor.methods({
    streamingConnected: function () {
        if (!kurento === null) return true;
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
    },
    

    streamingSourceAdd: function (type) {
        var sourceid = streamingsources.insert({
            title: 'New Source',
            type: type,
            servercandidates: [],
            serveranswer: null,
            settings: {},            
            connected: false
        });
        
        return sourceid;
    },
    
    streamingSourceDel: function (sourceid) {
        // TODO also remove from mixes!
        return streamingsources.remove(sourceid);
    },

    streamingSourceTitle: function (sourceid, title) {
        streamingsources.update(sourceid, {$set: {title: title}});
    },
    
    streamingSourceSetting: function (sourceid, setting, value) {
        var s = {}; s['settings.'+setting] = value;
        streamingsources.update(sourceid, {$set: s});
    },
    
    streamingSourceOffer: function (sourceid, offer) {
        if (!kurento) throw new Meteor.Error('not-connected', "Cedar isn't connected to the Kurento server!");

        var source = sources[sourceid];
        if (!source) {
            source = new StreamingStuff();
            sources[sourceid] = source;
        }

        source.element = create('WebRtcEndpoint');
        source.element.setMaxVideoRecvBandwidth(0);
        source.element.setMaxVideoSendBandwidth(0);

        source.element.on('OnIceCandidate', Meteor.bindEnvironment(function (event) {
            streamingsources.update(sourceid, {$push: {servercandidates: event.candidate}});
        }.bind(this)));
        
        while (source.candidates.length > 0) source.element.addIceCandidate(source.candidates.pop());
        
        source.element.connect(source.element, (err) => {if (err) console.log(err)});
        
        source.element.processOffer(offer, Meteor.bindEnvironment(function (err, answer) {
            streamingsources.update(sourceid, {$set: {serveranswer: answer}});
        }.bind(this)));

        source.element.gatherCandidates((err) => {if (err) console.log('error gathering candidates', err)});
    },
    
    streamingSourceClearServerAnswer: function (sourceid) {
        streamingsources.update(sourceid, {$set: {serveranswer: null, connected: true}});
    },
    
    streamingSourceIceCandidate: function (sourceid, _candidate) {
        var candidate = KurentoClient.register.complexTypes.IceCandidate(JSON.parse(_candidate));
        var source = sources[sourceid];
        if (!source) {
            source = new StreamingStuff();
            sources[sourceid] = source;
        }
        
        if (source.element) source.element.addIceCandidate(candidate);
        else source.candidates.push(candidate);
    },
    
    streamingSourceClearServerCandidates: function (sourceid) {
        streamingsources.update(sourceid, {$set: {servercandidates: []}});
    },
    
    streamingSourceConnect: function (sourceid) {
        if (!kurento) throw new Meteor.Error('not-connected', "Cedar isn't connected to the Kurento server!");
        var source = sources[sourceid];
        if (!source) {
            source = new StreamingStuff();
            sources[sourceid] = source;
        }
        
        var url = streamingsources.findOne(sourceid).settings['streamingsource_url'];
        if (!url) throw new Meteor.Error('no-url', `No URL for source ${sourceid}`);
        
        pipeline.create('PlayerEndpoint', {uri: url}, Meteor.bindEnvironment((err, endpoint) => {
            if (err) throw new Meteor.Error('rtsp-error', err);
            source.element = endpoint;

            endpoint.play();

            streamingsources.update(sourceid, {$set: {connected: true}});
        }));
        
    },
    
    streamingViewerAdd: function (sourceid) {
        var viewid = streamingviewers.insert({
            source: sourceid,
            servercandidates: [],
            serveranswer: null,
            connected: false
        });
        
        return viewid;
    },
    
    streamingViewerOffer: function (viewid, offer) {
        if (!kurento) throw new Meteor.Error('not-connected', "Cedar isn't connected to the Kurento server!");
        
        var sourceid = streamingviewers.findOne(viewid).source;
        
        if (!streamingsources.findOne(sourceid).connected)
            throw new Meteor.Error('source-not-connected', "Streaming source isn't connected!");
                    
        var source = sources[sourceid];

        var viewer = viewers[viewid];
        if (!viewer) {
            viewer = new StreamingStuff();
            viewers[viewid] = viewer;
        }

        viewer.element = create('WebRtcEndpoint');
        viewer.element.setMaxVideoRecvBandwidth(0);
        viewer.element.setMaxVideoSendBandwidth(0);
        
        viewer.element.on('OnIceCandidate', Meteor.bindEnvironment(function (event) {
            streamingviewers.update(viewid, {$push: {servercandidates: event.candidate}});
        }.bind(this)));
        
        while (viewer.candidates.length > 0) viewer.element.addIceCandidate(viewer.candidates.pop());
        
        source.element.connect(viewer.element, (err) => {if (err) console.log(err)});
        
        viewer.element.processOffer(offer, Meteor.bindEnvironment(function (err, answer) {
            streamingviewers.update(viewid, {$set: {serveranswer: answer, connected: true}});
        }.bind(this)));

        viewer.element.gatherCandidates((err) => {if (err) console.log('error gathering candidates', err)});
    },
    
    streamingViewerClearServerAnswer: function (viewid) {
        streamingsources.update(viewid, {$set: {serveranswer: null}});
    },
    
    streamingViewerIceCandidate: function (viewid, _candidate) {
        var candidate = KurentoClient.register.complexTypes.IceCandidate(JSON.parse(_candidate));
        var viewer = viewers[viewid];
        if (!viewer) viewer = new StreamingStuff();
        
        if (viewer.element) viewer.element.addIceCandidate(candidate);
        else viewer.candidates.push(candidate);
    },
    
    streamingViewerClearServerCandidates: function (viewid) {
        streamingviewers.update(viewid, {$set: {servercandidates: []}});
    }
});
