import { Cedar } from '/imports/lib/connection';
import { Template } from 'meteor/templating';
import { Stages } from '/imports/configure/stages/collections.js';

import '/imports/lib/widgets/editable_text';
import './stage_settings.html';

Router.route('/stage/:_id', function () {
    this.wait(Cedar.subscribe('stages.one', this.params._id));
    
    if (this.ready()) {
        this.render('stage_settings', {
            data: function () {
                return Stages.findOne({_id: this.params._id});
            }
        });
    } else {
        this.render('loading');
    }
}, {
    name: 'stage.settings'
});

Template.stage_settings.onRendered(function () {
    if (Roles.userIsInRole(Meteor.user(), ['admin'])) {
        this.$('#display-layers-list').sortable({
            opacity: 0.7, revert: true, scroll: true
        });

        this.autorun(() => {
            Template.currentData(); // Establish reactive dependency;
            this.$('#display-layers-list').sortable('refresh');
            this.$('#display-layers-list').sortable('refreshPositions');
        });
    }
});


Template.stage_settings.events({
    'edited #stage_title'(event, template) {
        let title = event.detail;
        if (title.length > 0) Meteor.call('stages.title', template.data._id, title);
    },
    
    'click #del-stage'(event, template) {
        template.$('#del-stage-modal').modal('hide').on('hidden.bs.modal', () => {
            Meteor.call('stages.remove', template.data._id);
            Router.go('stages.menu');
        });
    },
    
    'sortstop #display-layers-list'(event, template) {
        let layers = [];

        template.$(event.currentTarget).children('li').each(function (index) {
            layers.push(this.textContent);
        });
        
        Meteor.call('stages.display.set_layers', template.data._id, layers);
    },
    
    'click .del-layer'(event, template) {
        console.log(this);
        let layers = template.data.display.layers;
        layers.splice(layers.indexOf(this.toString()), 1);
        
        Meteor.call('stages.display.set_layers', template.data._id, layers);
    },
    
    'click #add-layer, keypress #add-layer-input'(event, template) {
        // TODO use Meteor form validation magic to display errors instead of just returning on error
        if (event.type == 'keypress' && event.which != 13) return;        
        
        let input = template.$('#add-layer-input');
        let new_layer = input.val();
        input.val('');
        
        if (new_layer.length < 1) return;
        
        let layers = template.data.display.layers;
        if (layers.indexOf(new_layer) != -1) return;
        
        layers.push(new_layer);
        
        Meteor.call('stages.display.set_layers', template.data._id, layers);
    }
});
