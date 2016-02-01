Template.musicstandchart.helpers({
    sections: function () {
        var sections = [];
        for (var i in this.arrangement.order) {
            var section = songsections.findOne(this.arrangement.order[i]);
            section._id = i;
            section.section = i;
            sections.push(section);
        }
        return sections;
    },
    
    getSetKey: function () {
        return Template.parentData().settings.key;
    },
    
    getKeys: function () {
        var keys = [];
        for (var p in key2num) if (key2num.hasOwnProperty(p)) keys.push(p);
        return keys;
    },
    
    keySelected: function (key) {
        if (Session.get('transpose-' + Template.parentData()._id) == key) {
            return 'selected';
        }
    },
        
    order: function () {
        var o = [];
        for (var i in this.arrangement.order) {
            o.push(songsections.findOne(this.arrangement.order[i]).title);
        }
        return o.join(', ');
    },

    getText: function () {
        return songTextToChordChart(this.text, Template.parentData(2).transpose.get(), 
                                    Session.get('flat-' + Template.parentData(2)._id));
    },
    
    isHeaderActive: function () {
        var action = Template.parentData();
        if (action._id == Template.parentData(2).active) {
            if (action.args['index'] === undefined) return 'musicstand-active';
        }
    },

    isActive: function () {
        var action = Template.parentData(3);
        if (action._id == Template.parentData(4).active) {
            var n = Template.parentData().contents.indexOf(this);
            if (Template.parentData().section == action.args.section &&
                n == action.args.index) return 'musicstand-active';
        }
    }
});

Template.musicstandchart.onCreated(function () {
    var t = Template.currentData();
    
    var k = Template.parentData().settings.key
    Session.set('transpose-' + t._id, k);
    
    if (k.length > 1 && k[1] == 'b')
        Session.set('flat-' + t._id, true);
    else
        Session.set('flat-' + t._id, false);
    
    this.autorun(function () {
        var t = Template.currentData();
        if (!t.transpose) t.transpose = new ReactiveVar(0);

        var songkey = key2num[t.key];
        var userkey = key2num[Session.get('transpose-' + t._id)];
        
        t.transpose.set(userkey - songkey, Session.get('flat-', t._id));
    });
});

Template.musicstandchart.events({
    'change .chart-key': function (event, template) {
        var k = $(event.target).val();
        Session.set('transpose-' + template.data._id, k);
        if (k.length > 1 && k[1] == 'b')
            Session.set('flat-' + template.data._id, true);
        else
            Session.set('flat-' + template.data._id, false);
    }
});
