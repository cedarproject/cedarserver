Template.set.onRendered(function () {
    this.handler = function (setid, event) {
        // This is pretty ugly.
        
        if (event.key != 'ArrowLeft' && event.key != 'ArrowRight') return;
    
        var set = sets.findOne(setid);
        if (set.active) {
            var action = actions.findOne(set.active);
            var args = action.args;
            var num = actions.findOne({}, {sort: {order: -1}}).order;

            if (action.type == 'song') {
                var arrangement = songarrangements.findOne(action.settings.arrangement);
                
                if (typeof args['section'] === 'undefined' || typeof args['index'] === 'undefined') {
                    // Not on a slide.
                    if (event.key == 'ArrowRight') {
                        // Go to the first slide.
                        args = {section: 0, index: 0};
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                    
                    // If ArrowLeft, goes to previous action.
                }
                    
                else {
                    // On a slide.
                    var section = songsections.findOne(arrangement.order[args.section]);

                    if (event.key == 'ArrowRight' && args.index >= section.contents.length - 1) {
                        // At the end of the current songsection
                        if (args.section < arrangement.order.length - 1) {
                            // Going to next section
                            args = {section: args.section + 1, index: 0};
                            Meteor.call('actionArgs', action._id, args);
                            Meteor.call('setActivate', set._id, action._id);
                            return;
                        }
                        
                        // If at end of song, goes to next action.
                    }

                    else if (event.key == 'ArrowLeft' && args.index <= 0) {
                        // At the beginning of the current songsection
                        if (args.section > 0) {
                            // Going to previous section.
                            var prev = songsections.findOne(arrangement.order[args.section - 1]);
                            args = {section: args.section - 1, index: prev.contents.length - 1};
                            Meteor.call('actionArgs', action._id, args);
                            Meteor.call('setActivate', set._id, action._id);
                            return;
                        }
                        
                        // If at beginning of song, goes to previous action.
                    }
                    
                    else if (event.key == 'ArrowRight') {
                        // Go to next slide
                        args = {section: args.section, index: args.index + 1};
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                    
                    else if (event.key == 'ArrowLeft') {
                        // Go to previous slide
                        args = {section: args.section, index: args.index - 1};
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                }
            }
            
            else if (action.type == 'presentation') {
                var pres = presentations.findOne(action.presentation);
                                
                if (typeof args['order'] === 'undefined') {
                    // Not on a slide
                    if (event.key == 'ArrowRight') {
                        args = {order: 0, fillin: 0};
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                }
                
                else {
                    // On a slide
                    var slides = presentationslides.find({presentation: pres._id}).count();

                    var slide = presentationslides.findOne({presentation: pres._id, order: args.order});

                    var cont = false;
                    var fillins = 0;
                    
                    if (!pres.imported) {
                        slide.content.ops.forEach((section, i) => {
                            if (section['attributes'] && section['attributes']['strike']) {
                                if (!cont) {
                                    fillins++;
                                    cont = true;
                                }
                            } else cont = false;
                        });
                    }

                    if (event.key == 'ArrowRight' && args.fillin < fillins) {
                        args.fillin++;
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                    
                    else if (event.key == 'ArrowLeft' && args.fillin > 0) {
                        args.fillin--;
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                    
                    else if (event.key == 'ArrowRight' && args.order < slides - 1) {
                        args = {order: args.order + 1, fillin: 0};
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                    
                    else if (event.key == 'ArrowLeft' && args.order > 0) {
                        args = {order: args.order - 1, fillin: 0};
                        Meteor.call('actionArgs', action._id, args);
                        Meteor.call('setActivate', set._id, action._id);
                        return;
                    }
                }
            }
            
            // If none of the above returned, then go to the previous or next action, if any
            
            var go = null;

            if (event.key == 'ArrowLeft' && action.order > 0)
                var go = actions.findOne({set: set._id, order: action.order - 1});
            else if (event.key == 'ArrowRight' && action.order < num)
                var go = actions.findOne({set: set._id, order: action.order + 1});
            
            if (go) {
                Meteor.call('actionArgs', go._id, {});
                Meteor.call('setActivate', set._id, go._id);
            }
        }
    }.bind(this, Template.currentData()._id);
    
    $(window).keydown(this.handler);
});

Template.set.onDestroyed(function () {
    $(window).off('keydown', null, this.handler);
});
