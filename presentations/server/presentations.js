function getPresentation (presid) {
    var pres = presentations.findOne(presid);
    if (!pres) throw new Meteor.Error('presentation-not-found', 'No such presentation with _id:' + presid);
    else return pres;
}

Meteor.methods({
    presentationNew: function () {
        return presentations.insert({
            title: 'New Presentation',
            settings: {},
            tags: [],
            imported: false
        });
    },
    
    presentationNewImported: function (title) {
        return presentations.insert({
            title: title,
            settings: {},
            tags: [],
            imported: true,
            importstatus: 'processing_1' // processing_1 > processing_2 > ready | error
        });
    },
    
    presentationImportStatus: function (presid, status) {
        presentations.update({_id: presid}, {$set: {importstatus: status}});
    },
    
    presentationDel: function (presid) {
        var pres = getPresentation(presid);

        if (pres.imported) {
            var fs = Npm.require('fs');
            var prefix = settings.findOne({key: 'mediadir'}).value;
            
            presentationslides.find({presentation: presid}).forEach((slide) => {
                fs.unlink(prefix + '/' + slide.imagepath, () => {});
            });
            
            fs.rmdir(prefix + '/presentations/' + presid);
        }

        presentationslides.remove({presentation: presid});
        presentations.remove(pres);
    },
    
    presentationTitle: function (presid, title) {
        var pres = getPresentation(presid);
        presentations.update(pres, {$set: {title: title}});
    },
    
    presentationSetting: function (presid, setting, value) {
        var pres = getPresentation(presid);
        var s = {}; s['settings.' + setting] = value;
        presentations.update(pres, {$set: s});
    },
    
    presentationAddSlide: function (presid) {
        var pres = getPresentation(presid);

        var last = presentationslides.findOne({presentation: presid}, {sort: {order: -1}, fields: {order: 1}});
        if (last) var order = last.order + 1;
        else var order = 0;
        
        var defaultcolor = combineSettings(pres.settings).presentations_font_color;
        var cs = '#';
        defaultcolor.forEach((v) => {cs += ('0' + Math.round(v * 255.0).toString(16)).slice(-2)});
        
        var content = {
            ops: [{
                attributes: {color : cs},
                insert: 'New slide'
            }]
        };
            
        return presentationslides.insert({
            presentation: presid,
            content: content,
            images: [],
            settings: {},
            order: order
        });
    },
    
    presentationAddImportedSlide: function (presid, imagepath, order) {
        return presentationslides.insert({
            presentation: presid,
            imagepath: imagepath,
            order: order
        });
    },
    
    presentationSlideDel: function (slideid) {
        var slide = presentationslides.findOne(slideid);
        var pres = presentations.findOne(slide.presentation);
        
        if (pres.imported) {
            var fs = Npm.require('fs');
            var prefix = settings.findOne({key: 'mediadir'}).value;
            
            fs.unlink(prefix + '/' + slide.imagepath, () => {});
        }
        
        var index = slide.order;
        presentationslides.remove(slideid);
        presentationslides.update({presentation: slide.presentation, order: {$gte: index}}, {$inc: {order: -1}}, {multi: true});
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
    }
});
