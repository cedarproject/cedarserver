import { Cedar } from '/imports/lib/connection';
import { Template } from 'meteor/templating';

import { Stages } from '/imports/configure/stages/collections.js';
import './stages_menu.html';

Router.route('/stages', function () {
    this.wait(Cedar.subscribe('stages.all'));
    
    if (this.ready()) {
        this.render('stages_menu', {
            data: function () {
                return Stages.find({}, {sort: [['title', 'asc']]});
            }
        });
    } else {
        this.render('loading');
    }
}, {
    name: 'stages.menu'
});

Template.stages_menu.events({
    'click #new-stage'(event, template) {
        Meteor.call('stages.new', (err, _id) => {
            if (err) console.error(err);
            else Router.go('stage.settings', {_id: _id});
        });
    }
});
