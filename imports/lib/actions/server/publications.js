import { Meteor } from 'meteor/meteor';

import { is_viewer } from '/imports/lib/accounts/role_helpers.js';

import { Actions } from '../collections.js';
import { ActionTypes } from '/imports/lib/actions/register.js';

Meteor.publish('actions.one', function (_id) {
    is_viewer(this);
    
    return Actions.find({_id: _id});
});

Meteor.publish('actions.by_owner', function (owner_type, owner_id) {
    is_viewer(this);
    
    return Actions.find({_owner_type: owner_type, _owner_id: owner_id});
});

Meteor.publish('actions.by_owner_with_content', function (owner_type, owner_id) {
    is_viewer(this);
    
    let actions = Actions.find({_owner_type: owner_type, _owner_id: owner_id});
    
    let collections = {}
    let queries = {};
    
    actions.forEach((action) => {
        let type = ActionTypes[action._type_id];
        type.get_content_query(action).forEach((query) => {
            let name = query.collection._name;
            
            if (!collections.hasOwnProperty(name)) {
                collections[name] = query.collection;
                queries[name] = [];
            }
            
            queries[name].push(query.query);
        });
    });
    
    let cursors = [actions];
    
    for (let name in collections) {
        cursors.push(collections[name].find({
            $or: queries[name]
        });
    }
    
    return cursors;
});
