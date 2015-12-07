RTCPeerConnection = WebRTC.RTCPeerConnection;
getUserMedia = WebRTC.getUserMedia;

Template.streamingSourceStream.onRendered(function () {
    var webRtcPeer = null;
    Template.currentData().webRtcPeer = webRtcPeer;
        
    var settings = combineSettings(this.data.settings);

    var constraints = {
        audio: settings.streamingsource_audio
    };
    
    if (settings.streamingsource_video) 
        constraints.video = {
            width: settings.streamingsource_width,
            height: settings.streamingsource_height,
            framerate: settings.streamingsource_framerate
        }
    else constraints.video = false;
    
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        var options = {
            remoteVideo: this.$('#stream-video')[0],
            videoStream: stream, 
            onicecandidate: (candidate) => {
                // Meteor's EJSON won't serialize RTCIceCandidate objects for some reason, but plain JSON will.
                Meteor.call('streamingSourceIceCandidate', this.data._id, JSON.stringify(candidate));
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

        streamingsources.find({_id: this.data._id}).observe({changed: check});
            
        var webRtcPeer = WebRtcPeer.WebRtcPeerSendrecv(options, (err) => {
	        if(err) {console.log('error sending video:', err); return};

	        webRtcPeer.generateOffer((err, offer) => {
	            if (err) {console.log('error sending video:', err); return};
	            
	            Meteor.call('streamingSourceOffer', this.data._id, offer);
	            check(this.data);
            });
        });
    }).catch((err) => {
        console.log(err.name + ": " + err.message);
    });
});
