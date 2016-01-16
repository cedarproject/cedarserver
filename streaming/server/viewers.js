Meteor.startup(function () {
    streamingviewers.remove({});
});

Meteor.methods({
    streamingViewerAdd: function (type, _id) {
        var v = {
            servercandidates: [],
            serveranswer: null,
            connected: false
        }
        
        if (type == 'source') v.source = _id;
        else if (type == 'mix') v.mix = _id;

        var viewid = streamingviewers.insert(v);
        
        return viewid;
    },
    
    streamingViewerOffer: function (viewid, offer) {
        if (!kurento) throw new Meteor.Error('not-connected', "Cedar isn't connected to the Kurento server!");
        
        var viewer = streamingviewers.findOne(viewid);
        
        if (viewer.source)
            var sourcestuff = streamingGetSourceStuff(viewer.source);
        else if (viewer.mix)
            var sourcestuff = mixes[viewer.mix];

        var viewerstuff = viewers[viewid];
        if (!viewerstuff) var viewerstuff = viewers[viewid] = new StreamingStuff();

        viewerstuff.element = create('WebRtcEndpoint');
        
        viewerstuff.element.on('OnIceCandidate', Meteor.bindEnvironment(function (event) {
            streamingviewers.update(viewid, {$push: {servercandidates: event.candidate}});
        }.bind(this)));

        viewerstuff.element.on('MediaStateChanged', (event) => {
            if (event.newState == 'DISCONENCTED') {
                viewerstuff.element.release();
                streamingviewers.remove(viewid);
            }
        });
        
        while (viewerstuff.candidates.length > 0) viewerstuff.element.addIceCandidate(viewerstuff.candidates.pop());
        
        sourcestuff.passthrough.connect(viewerstuff.element, (err) => {if (err) console.log(err)});
        
        viewerstuff.element.processOffer(offer, Meteor.bindEnvironment(function (err, answer) {
            streamingviewers.update(viewid, {$set: {serveranswer: answer, connected: true}});
        }.bind(this)));

        viewerstuff.element.gatherCandidates((err) => {if (err) console.log('error gathering candidates', err)});
    },
    
    streamingViewerClearServerAnswer: function (viewid) {
        streamingsources.update(viewid, {$set: {serveranswer: null}});
    },
    
    streamingViewerIceCandidate: function (viewid, _candidate) {
        if (!kurento) throw new Meteor.Error('not-connected', "Cedar isn't connected to the Kurento server!");

        var candidate = KurentoClient.register.complexTypes.IceCandidate(JSON.parse(_candidate));
        var viewerstuff = viewers[viewid];
        if (!viewerstuff) var viewerstuff = viewers[viewid] = new StreamingStuff();
        
        if (viewerstuff.element) viewerstuff.element.addIceCandidate(candidate);
        else viewerstuff.candidates.push(candidate);
    },
    
    streamingViewerClearServerCandidates: function (viewid) {
        streamingviewers.update(viewid, {$set: {servercandidates: []}});
    }
});
