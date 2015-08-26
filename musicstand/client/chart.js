Template.musicstandchart.helpers({
    sections: function () {
        var sections = [];
        for (var i in this.arrangement.order) {
            var section = songsections.findOne(this.arrangement.order[i]);
            if (sections.length > 0) section.number = 
                sections[sections.length-1].number +
                sections[sections.length-1].contents.length;
            else section.number = 0;
            sections.push(section);
        }
        return sections;
    },
    
    getKeys: function () {
        var keys = [];
        for (var p in key2num) if (key2num.hasOwnProperty(p)) keys.push(p);
        return keys;
    },
    
    keySelected: function (key) {
        if (Template.parentData(2).settings.key == key) return 'selected';
    },
        
    order: function () {
        var o = [];
        for (var i in this.arrangement.order) {
            o.push(songsections.findOne(this.arrangement.order[i]).title);
        }
        return o.join(', ');
    },

    getText: function () {
        return songTextToChordChart(this.text, Template.parentData(2).transpose.get());
    },
    
    isHeaderActive: function () {
        var action = Template.parentData();
        if (action._id == Template.parentData(2).active) {
            if (action.args['number'] === undefined) return 'musicstand-active';
        }
    },

    isActive: function () {
        var action = Template.parentData(3);
        if (action._id == Template.parentData(4).active) {
            var n = Template.parentData().number + Template.parentData().contents.indexOf(this);
            if (n == action.args.number) return 'musicstand-active';
        }
    }
});

Template.musicstandchart.onCreated(function () {
    var t = Template.currentData();
    t.transpose = new ReactiveVar(0);

    if (!Session.get('transpose-' + t._id)) Session.set('transpose-' + t._id, false);
    this.autorun(function () {
        var t = Template.currentData();
        if (!t.transpose) t.transpose = new ReactiveVar(0);

        var songkey = key2num[t.key];
        var actionkey = key2num[Template.parentData().settings.key];
        var userkey = key2num[Session.get('transpose-'+t._id)] || 0;
        
        t.transpose.set((songkey - actionkey) - (songkey - userkey));
    });
});

Template.musicstandchart.events({
    'change .chart-key': function (event, template) {
        Session.set('transpose-' + template.data._id, $(event.target).val());
    }
});
