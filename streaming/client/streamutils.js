receiveStream = function (type, _id, video) {
    var viewid = null;
    var webRtcPeer = null;

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
                    webRtcPeer.addIceCandidate(candidate);
                });
                
                Meteor.call('streamingViewerClearServerCandidates', viewer._id);
            }

            if (viewer.serveranswer !== null) {
                webRtcPeer.processAnswer(viewer.serveranswer);
                Meteor.call('streamingViewerClearServerAnswer', viewer._id);
            }
        }
    }

    Meteor.call('streamingViewerAdd', type, _id, (err, _viewid) => {
        viewid = _viewid;
        streamingviewers.find({_id: viewid}).observe({changed: check});
            
        webRtcPeer = WebRtcPeer.WebRtcPeerRecvonly(options, (err) => {
	        if (err) {console.log('error sending video:', err); return};

	        webRtcPeer.generateOffer((err, offer) => {
	            if (err) {console.log('error sending video:', err); return};
	            
	            Meteor.call('streamingViewerOffer', viewid, offer);
	            check(streamingviewers.findOne(viewid));
            });
        });
    });
};
