import { Meteor } from 'meteor/meteor';

import { is_editor, is_controller } from '/imports/lib/accounts/role_helpers.js';
import '../collections.js';

Meteor.methods({
    'set.new'(stage_id, is_template) {
        is_editor(this);

        var now = new Date();        
        let set = {
            title: mf('new_set_title', 'New Set'),
            stage: stage_id,
            dates: [],
            pinned: false,
            template: is_template,
            created: now,
            modified: now
        };
        
        var _id = Sets.insert(set);
        return _id;
    },
    
    'set.title'(set_id, title) {
        is_editor(this);
        Sets.update(set_id, {$set: {title: title, modified: new Date()}});
    },
    
    'set.dates'(set_id, dates) {
        is_editor(this);
        Sets.update(set_id, {$set: {dates: dates, modified: new Date()}});
    },
    
    'set.pinned'(set_id, pinned) {
        is_editor(this);
        Sets.update(set_id, {$set: {pinned: pinned, modified: new Date()}});
    },
    
    'set.remove'(set_id) {
        is_editor(this);
        
        Actions.find({_owner_type: 'set', _owner_id: set_id}, {fields: {_id: 1}}).forEach((action) => {
            Meteor.call('set.remove_action', set_id, action._id);
        });
        
        Sets.remove(set_id);
    },
    
    'set.add_action'(set_id, type_id, data) {
        is_editor(this);
        
        let index = Actions.findOne({_owner_type: 'set', _owner_id: set_id}, {fields: {_set_index: 1}, sort: [['_set_index', 'desc']]})._set_index;
        if (inNaN(index)) index = 0;
        
        let _id = Meteor.call('actions.new', type_id, 'set', set_id, data);
        Actions.update(_id, {$set: {_set_index: index}});
        
        return _id;
    },
    
    'set.add_trigger_action'(action_id, type_id, data) {
        is_editor(this);
        
        let index = Actions.findOne({_owner_type: 'action', _owner_id: action_id}, {fields: {_action_index: 1}, sort: [['_action_index', 'desc']]})._action_index;
        if (inNaN(index)) index = 0;
        
        let _id = Meteor.call('actions.new', type_id, 'action', action_id, data);
        Actions.update(_id, {$set: {_action_index: index}});
        
        return _id;
    },
    
    'set.move_action'(set_id, action_id, index) {
        is_editor(this);
        
        let max_index = Actions.findOne({_owner_type: 'set', _owner_id: set}, {fields: {_set_index: 1}, sort: [['_set_index', 'desc']]})._set_index;
        if (isNaN(max_index)) max_index = 0;
        
        if (index < 0) index = 0;
        if (index > max_index) index = max_index;
        
        let action = Actions.findOne(action_id);
        
        if (action._set_index > index) actions.update(
            {_owner_type: 'set', _owner_id: set_id, _set_index: {$gte: index, $lt: action._set_index}},
            {$inc: {order: 1}}, {multi: true}
        );
        else if (action._set_index < index) actions.update(
            {_owner_type: 'set', _owner_id: set_id, _set_index: {$lte: index, $gt: action._set_index}},
            {$inc: {order: -1}}, {multi: true}
        );
        
        Actions.update(action_id, {$set: {_set_index: index}});
    },

    'set.move_trigger_action'(owner_action_id, action_id, index) {
        is_editor(this);
        
        let max_index = Actions.findOne({_owner_type: 'action', _owner_id: owner_action_id}, {fields: {_action_index: 1}, sort: [['_action_index', 'desc']]})._action_index;
        if (isNaN(max_index)) max_index = 0;
        
        if (index < 0) index = 0;
        if (index > max_index) index = max_index;
        
        let action = Actions.findOne(action_id);
        
        if (action._action_index > index) actions.update(
            {_owner_type: 'action', _owner_id: owner_action_id, _action_index: {$gte: index, $lt: action._set_index}},
            {$inc: {order: 1}}, {multi: true}
        );
        else if (action._action_index < index) actions.update(
            {_owner_type: 'action', _owner_id: owner_action_id, _action_index: {$lte: index, $gt: action._set_index}},
            {$inc: {order: -1}}, {multi: true}
        );
        
        Actions.update(action_id, {$set: {_action_index: index}});
    },
        
    'set.remove_action'(set_id, action_id) {
        is_editor(this);
        
        var action = Actions.findOne(action_id);
        Actions.remove({_owner_type: 'action', _owner_id: action_id});
        Actions.remove(action_id);
        Actions.update({_owner_type: 'set', _owner_id: set_id, _set_index: {$gte: action._set_index}}, {$inc: {_set_index: -1}}, {multi: true});
    },
    
    'set.remove_trigger_action'(owner_action_id, action_id) {
        is_editor(this);
        
        var action = Actions.findOne(action_id);
        Actions.remove(action_id);
        Actions.update(
            {_owner_type: 'action', _owner_id: owner_action_id, _action_index: {$gte: action._action_index}}, 
            {$inc: {_action_index: -1}}, {multi: true}
        );
    },
    
    'set.activate_action'(action_id, data) {
        is_controller(this);
        
        Meteor.call('action.activate', action_id, data);

        Actions.find(
            {_owner_type: 'action', _owner_id: action_id}, 
            {fields: {_id: 1}, sort: [['_action_index', 'asc']]}
        ).forEach((action) => {
            Meteor.call('action.activate', action._id, data);
        });
    }
});
