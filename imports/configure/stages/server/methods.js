import { Meteor } from 'meteor/meteor';

import { is_admin } from '/imports/lib/accounts/role_helpers.js';
import { Stages } from '../collections.js';

Meteor.methods({
    'stages.new'() {
        is_admin(this);
        
        var _id = Stages.insert({
            title: mf('new_stage_title', 'New Stage'),
            display: {
                layers: ['audio', 'background', 'foreground'],
                layeractive: {'audio': null, 'background': null, 'foreground': null}
            }
        });
        
        return _id;
    },
    
    'stages.title'(stage_id, title) {
        is_admin(this);
        Stages.update(stage_id, {$set: {title: title}});
    },
    
    'stages.modify'(stage_id, modifier) {
        is_admin(this);
        Stages.update(stage_id, modifier);
    },
    
    'stages.remove'(stage_id) {
        is_admin(this);
        // TODO remove or reassign all controls and minions attached to deleted stage!
        Stages.remove(stage_id);
    },
    
    'stages.display.set_layers'(stage_id, layers) {
        is_admin(this);
        
        let stage = Stages.findOne(stage_id);
        
        let layeractive = {};
        layers.forEach((layer) => {
            layeractive[layer] = stage.display.layeractive[layer] || null;
        });
        
        Stages.update(stage_id, {$set: {'display.layers': layers, 'display.layeractive': layeractive}});
    }
});
