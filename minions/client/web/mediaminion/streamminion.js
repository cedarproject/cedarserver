mediaminion_stream = function (source, canvas) {
    var webRtcPeer = null;
    
    var settings = combineSettings(source.settings);
    
    var stream = canvas.captureStream(settings.streamingsource_framerate);

    var options = {
        videoStream: stream, 
        onicecandidate: (candidate) => {
            // Meteor's EJSON won't serialize RTCIceCandidate objects for some reason, but plain JSON will.
            Meteor.call('streamingSourceIceCandidate', source._id, JSON.stringify(candidate));
        }
    };
    
    var check = (source) => {
        if (webRtcPeer !== null) {
            if (source.servercandidates.length > 0) {
                source.servercandidates.forEach((candidate) => {
                    webRtcPeer.addIceCandidate(candidate);
                });
                
                Meteor.call('streamingSourceClearServerCandidates', source._id);
            }

            if (source.serveranswer !== null) {
                webRtcPeer.processAnswer(source.serveranswer);
                Meteor.call('streamingSourceClearServerAnswer', source._id);
            }
        }
    }

    streamingsources.find({_id: source._id}).observe({changed: check});
        
    var webRtcPeer = WebRtcPeer.WebRtcPeerSendrecv(options, (err) => {
        if(err) {console.log('error sending video:', err); return};

        webRtcPeer.generateOffer((err, offer) => {
            if (err) {console.log('error sending video:', err); return};
            
            Meteor.call('streamingSourceOffer', source._id, offer);
            check(source);
        });
    });
};
