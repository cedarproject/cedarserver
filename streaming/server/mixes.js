streamingMixStartAll = function () {
    streamingmixes.find({}).forEach((mix) => {
        streamingMixStart(mix);
    });
};

streamingMixStart = function (mix) {
    if (!kurento) throw new Meteor.Error('not-connected', "Cedar isn't connected to the Kurento server!");
    
    var mixstuff = mixes[mix._id];
    if (!mixstuff) var mixstuff = mixes[mix._id] = new StreamingStuff();
    
    mixstuff.element = create('PassThrough');
    mixstuff.element.connect(mixstuff.passthrough);
    
    mixstuff.current_audio = null;
    mixstuff.current_video = null;
    
    Meteor.call('streamingMixChangeVideoMix', mix._id, mix.videomix);
    Meteor.call('streamingMixChangeAudioMix', mix._id, mix.audiomix);
};

Meteor.methods({
    streamingMixAdd: function () {
        var mixid = streamingmixes.insert({
            title: 'New Mix',
            settings: {},
            videomix: [],
            audiomix: [],
            presets: [],
            shortcuts: []
        });
        
        return mixid;
    },
    
    streamingMixDel: function (mixid) {
        // TODO also remove from mixes!
        return streamingmixes.remove(mixid);
    },

    streamingMixTitle: function (mixid, title) {
        streamingmixes.update(mixid, {$set: {title: title}});
    },
    
    streamingMixSetting: function (mixid, setting, value) {
        var s = {}; s['settings.'+setting] = value;
        streamingmixes.update(mixid, {$set: s});
    },

    
    streamingMixAddSource: function (mixid, sourceid) {
        streamingmixes.update(mixid, {$push: {sources: sourceid}});
    },
    
    streamingMixRemoveSource: function (mixid, sourceid) {
        streamingmixes.update(mixid, {$pull: {sources: sourceid}});
    },

    
    streamingMixChangeVideoMix: function (mixid, videomix) {
        var mixstuff = mixes[mixid];
        if (mixstuff.current_video) mixstuff.current_video.disconnect(mixstuff.element, 'VIDEO');
        
        if (videomix.length > 0) {
            var sourcestuff = streamingGetSourceStuff(videomix[0]);
            mixstuff.current_video = sourcestuff.passthrough;
            
            sourcestuff.passthrough.connect(mixstuff.element, 'VIDEO');
        }
        
        streamingmixes.update(mixid, {$set: {videomix: videomix}});
    },

    streamingMixChangeAudioMix: function (mixid, audiomix) {
        var mixstuff = mixes[mixid];
        if (mixstuff.current_audio) mixstuff.current_audio.disconnect(mixstuff.element, 'AUDIO');
        
        if (audiomix.length > 0) {
            var sourcestuff = streamingGetSourceStuff(audiomix[0]);
            mixstuff.current_audio = sourcestuff.passthrough;
            
            sourcestuff.passthrough.connect(mixstuff.element, 'AUDIO');
        }
        
        streamingmixes.update(mixid, {$set: {audiomix: audiomix}});
    }
});
