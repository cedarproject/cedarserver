Meteor.startup(function () {
    streamingrecorders.remove({});
});

Meteor.methods({
    streamingRecorderStart: function (type, _id, uri) {
        var r = {type: type, uri: uri};
        if (type == 'source') r.source = _id;
        else if (type == 'mix') r.mix = _id;

        var recorderid = streamingrecorders.insert(r);
        
        var elements = create([{type: 'RecorderEndpoint', params: {uri: uri, mediaProfile: 'MP4_VIDEO_ONLY'}}]);
        
        recorder = elements[0];
        recorders[recorderid] = recorder;
        
        if (r.type == 'source') {
            var source = streamingGetSourceStuff(r.source);
            source.passthrough.connect(recorder);
        } else if (r.type == 'mix') {
            var mix = mixes[r.mix];
            mix.passthrough.connect(recorder);
        }
        
        recorder.record((err) => {if (err) console.log(err)});
        return recorderid;
    },
    
    streamingRecorderStop: function (recorderid) {
        recorders[recorderid].stop();
        recorders[recorderid].release();
        delete recorders[recorderid];
        streamingrecorders.remove(recorderid);
    }
});
