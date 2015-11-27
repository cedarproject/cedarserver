receiveStream = function (sourceid, video) {
    this.webRtcPeer = null;
    this.viewid = null;

    var options = {
        remoteVideo: video,
        onicecandidate: (candidate) => {
            // Meteor's EJSON won't serialize RTCIceCandidate objects for some reason, but plain JSON will.
            Meteor.call('streamingViewerIceCandidate', viewid, JSON.stringify(candidate));
        }
    };
    
    var check = (viewer) => {
        if (webRtcPeer !== null) {
            if (viewer.servercandidates.length > 0) {
                viewer.servercandidates.forEach((candidate) => {
                    this.webRtcPeer.addIceCandidate(candidate);
                });
                
                Meteor.call('streamingViewerClearServerCandidates', viewer._id);
            }

            if (viewer.serveranswer !== null) {
                this.webRtcPeer.processAnswer(viewer.serveranswer);
                Meteor.call('streamingViewerClearServerAnswer', viewer._id);
            }
        }
    }

    Meteor.call('streamingViewerAdd', sourceid, (err, viewid) => {
        this.viewid = viewid;
        streamingviewers.find({_id: this.viewid}).observe({changed: check});
            
        this.webRtcPeer = WebRtcPeer.WebRtcPeerRecvonly(options, (err) => {
	        if(err) {console.log('error sending video:', err); return};

	        this.webRtcPeer.generateOffer((err, offer) => {
	            if (err) {console.log('error sending video:', err); return};
	            
	            Meteor.call('streamingViewerOffer', this.viewid, offer);
	            check(streamingviewers.findOne(this.viewid));
            });
        });
    });
};
