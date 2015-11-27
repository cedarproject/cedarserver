Router.route('/streaming', {
    name: 'streamingMenu',
    waitOn: function () {
        return Meteor.subscribe('settings');
    }
});

Router.route('/streaming/debugresult', function () {
    var fs = Npm.require('fs');

    var headers = {
        'Cache-Control': 'max-age=0'
    };
    
    this.response.writeHead(200, headers);
    var stream = fs.createReadStream('/tmp/cedar-kurento-debug.dot.svg');
    return stream.pipe(this.response);
}, {where: 'server'});

Router.route('/streaming/sources', {name: 'streamingSources'});
Router.route('/streaming/source/:_id', {
    name: 'streamingSource',
    waitOn: function () {
        return Meteor.subscribe('streamingsources');
    },
    data: function () {
        return streamingsources.findOne({_id: this.params._id});
    }
});
Router.route('/streaming/stream/:_id', {
    name: 'streamingSourceStream',
    waitOn: function () {
        return Meteor.subscribe('streamingsources');
    },
    data: function () {
        return streamingsources.findOne({_id: this.params._id});
    }
});


Router.route('/streaming/mixes', {name: 'streamingMixes'});
Router.route('/streaming/mixes/:_id', {
    name: 'streamingMix',
    waitOn: function () {
        return Meteor.subscribe('streamingmixes');
    },
    data: function () {
        return streamingmixes.findOne({_id: this.params._id});
    }
});
