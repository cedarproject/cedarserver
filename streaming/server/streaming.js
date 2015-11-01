kurento = null;
pipeline = null;
sources = {};

create = () => {};

Meteor.methods({
    streamingConnected: function () {
        if (!kurento === null) return true;
        else return false;
    },
        
    streamingConnect: function () {
        var url = settings.findOne({key: 'streamingserver'}).value;
        if (!url) return false;
        
        kurento = KurentoClient.KurentoClient(url, function (kurento) {
            pipeline = Meteor.wrapAsync(KurentoClient.create, KurentoClient)('MediaPipeline');
            create = Meteor.wrapAsync(pipeline.create, pipeline);
        }, function (err) {
            console.log('error', err);
            kurento = null;
        });
    },
    

    streamingSourceAdd: function (type) {
        return streamingsources.insert({
            title: 'New Source',
            type: type,
            settings: {},
            connected: false
        });
    },
    
    streamingSourceDel: function (sourceid) {
        // TODO also remove from mixes!
        return streamingsources.remove(sourceid);
    },

    streamingSourceTitle: function (sourceid, title) {
        streamingsource.update(sourceid, {$set: {title: title}});
    },
    
    streamingSourceSetting: function (sourceid, setting, value) {
        var s = {}; s['settings.'+setting] = value;
        streamingsource.update(sourceid, {$set: s});
    }
    
});
