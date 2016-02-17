function getPresentation (presid) {
    var pres = presentations.findOne(presid);
    if (!pres) throw new Meteor.Error('presentation-not-found', 'No such presentation with _id:' + presid);
    else return pres;
}

Meteor.methods({
    presentationNew: function () {
        return presentations.insert({
            title: 'New Presentation',
            tags: []
        });
    },
    
    presentationDel: function (presid) {
        var pres = getPresentation(presid);
        presentationslides.remove({presentation: presid});
        presentations.remove(pres);
    },
    
    presentationTitle: function (presid, title) {
        var pres = getPresentation(presid);
        presentations.update(pres, {$set: {title: title}});
    },
    
    presentationAddSlide: function (presid) {
        var pres = getPresentation(presid);

        var last = presentationslides.findOne({presentation: presid}, {sort: {order: -1}, fields: {order: 1}});
        if (last) var order = last.order + 1;
        else var order = 0;
            
        return presentationslides.insert({
            presentation: presid,
            content: '<p>Click to edit.</p>',
            triggers: [],
            images: [],
            settings: {},
            order: order
        });
    },
    
    presentationSlideDel: function (slideid) {
        var index = presentationslides.findOne(slideid).order;
        presentationslides.remove(slideid);
        presentationslides.update({order: {$gte: index}}, {$inc: {order: -1}}, {multi: true});
    },
    
    presentationSlideContent: function (slideid, content) {
        presentationslides.update(slideid, {$set: {content: content}});
    },
    
    presentationSlideImageAdd: function (slideid, mediaid) {
        presentationslides.update(slideid, {$push: {images: mediaid}});
    },
    
    presentationSlideImageDel: function (slideid, mediaid) {
        presentationslides.update(slideid, {$pull: {images: mediaid}});
    },
    
    presentationSlideSetting: function (slideid, setting, value) {
        var s = {}; s['settings.' + setting] = value;
        presentationslides.update(slideid, {$set: s});
    },
    
    presentationSlideMove: function (slideid, index) {
        var slide = presentationslides.findOne(slideid);
        var presid = slide.presentation;

        var max = presentationslides.find({presentation: presid}).count() - 1;
        if (index < 0) index = 0;
        if (index > max) index = max;

        if (slide.order > index) presentationslides.update({presentation: presid, order: {$gte: index, $lt: slide.order}}, {$inc: {order: 1}}, {multi: true});
        else if (slide.order < index) presentationslides.update({presentation: presid, order: {$lte: index, $gt: slide.order}}, {$inc: {order: -1}}, {multi: true});
        presentationslides.update({_id: slideid}, {$set: {order: index}});
    },
    
    presentationActionActivate: function (action) {
        var targets = minions.find({type: 'media', stage: action.stage});
        
        if (!action.settings['layer']) action.settings.layer = 'foreground';

        var s = {}; s['layers.' + action.settings.layer] = action;        
        targets.forEach(function (minion) {
            if (minion.layers.hasOwnProperty(action.settings.layer))
                minions.update(minion._id, {$set: s});
        });
    }
});
