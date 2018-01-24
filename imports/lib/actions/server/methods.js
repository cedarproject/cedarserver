import { Meteor } from 'meteor/meteor';

import { is_editor, is_controller } from 'lib/accounts/role_helpers.js';

import '../register.js';
import '../collections.js';

Meteor.methods({
    'actions.new'(type_id, owner_type, owner_id, data) {
        is_editor(this);
        
        let type = ActionTypes[type_id];
        let action_base = {
            _type: type_id,
            _owner_type: owner_type,
            _owner_id: owner_id,
        };
        
        let action = type.create(action_base);
        let _id = Actions.insert(action);
        return _id;
    },
    
    'actions.replace'(old_id, type_id, data) {
        is_editor(this);
        
        let type = ActionTypes[type_id];
        let old_action = Actions.findOne(old_id);
        old_action._type = type_id;
        
        let action = type.create(old_action);
        Actions.update(old_id, action);
    },
    
    'actions.modify'(_id, modifier) {
        is_editor(this);
        Actions.update(_id, modifier);
    },
    
    'actions.remove'(_id) {
        is_editor(this);
        Actions.remove(_id);
    },
    
    'actions.activate'(_id, data) {
        is_controller(this);
        
        let action = Actions.findOne(_id);
        let type = ActionTypes[action._type];
        type.activate(action, data);
    }
});
