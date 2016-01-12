Meteor.methods({
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
