// There are three hard things in computer science: naming stuff, and off-by-one errors.
StreamingStuff = class StreamingStuff {
    constructor () {
        this.element = null;
        this.passthrough = create('PassThrough');
        this.candidates = [];
    }
};

streamingGetSourceStuff = function (sourceid) {
    if (!sources[sourceid]) sources[sourceid] = new StreamingStuff();
    return sources[sourceid];
};

Meteor.startup(function () {
    streamingsources.update({}, {$set: {connected: false}}, {multi: true});
});

Meteor.methods({
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
        streamingmixes.update({}, {$pull: {sources: sourceid}}, {multi: true});
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

        var source = streamingGetSourceStuff(sourceid);
        
        var settings = combineSettings(streamingsources.findOne(sourceid).settings);

        source.element = create('WebRtcEndpoint');
        source.element.setMaxOuputBitrate(settings.streamingsource_bitrate * 1000000);
        
        source.element.on('MediaStateChanged', (event) => {
            if (event.newState == 'DISCONENCTED') {
                source.element.release();
                streamingsources.update(sourceid, {$set: {connected: false}});
            }
        });

        source.element.on('OnIceCandidate', Meteor.bindEnvironment(function (event) {
            streamingsources.update(sourceid, {$push: {servercandidates: event.candidate}});
        }.bind(this)));
        
        while (source.candidates.length > 0) source.element.addIceCandidate(source.candidates.pop());
        
        source.element.connect(source.element, (err) => {if (err) console.log(err)});
        source.element.connect(source.passthrough, (err) => {if (err) console.log(err)});
        
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
        
        var source = streamingGetSourceStuff(sourceid);
        
        if (source.element) source.element.addIceCandidate(candidate);
        else source.candidates.push(candidate);
    },
    
    streamingSourceClearServerCandidates: function (sourceid) {
        streamingsources.update(sourceid, {$set: {servercandidates: []}});
    },
    
    streamingSourceConnect: function (sourceid) {
        if (!kurento) throw new Meteor.Error('not-connected', "Cedar isn't connected to the Kurento server!");
        var source = streamingGetSourceStuff(sourceid);
        
        var settings = combineSettings(streamingsources.findOne(sourceid).settings);
        if (settings.streamingsource_url.length == 0) throw new Meteor.Error('no-url', `No URL for source ${sourceid}`);
        
        pipeline.create('PlayerEndpoint', {uri: settings.streamingsource_url}, Meteor.bindEnvironment((err, endpoint) => {
            if (err) throw new Meteor.Error('rtsp-error', err);
            source.element = endpoint;
            source.element.setMaxOuputBitrate(settings.streamingsource_bitrate * 1000000);

            source.element.on('EndOfStream', Meteor.bindEnvironment((event) => {
                streamingsources.update(sourceid, {$set: {connected: false}});
                source.element.release();
            }));
            
            source.element.connect(source.passthrough, (err) => {if (err) console.log(err)});
            
            endpoint.play();

            streamingsources.update(sourceid, {$set: {connected: true}});
        }));
        
    }
});
