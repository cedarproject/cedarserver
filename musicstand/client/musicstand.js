Template.musicstand.helpers({
    actions: function () {
        return actions.find({set: this._id}, {sort: {order: 1}});
    },
    
    typeIs: function (type) {
        return this.type == type;
    },
    
    isActive: function () {
        if (Template.parentData()['active'] == this._id) return 'musicstand-active';
    },

    getSong: function () {
        var song = songs.findOne(this.song);
        song.arrangement = songarrangements.findOne(this.settings.arrangement);
        song.action = this._id;
        return song;
    }
});

Template.musicstand.onRendered(function () {
    this.autorun(function () {
        // Bind to the current Set and Action data context so this gets autorun when they change.
        var activeid = Template.currentData().active;
        var action = actions.findOne(activeid);
        
        if ($('#scroll-lock').hasClass('active')) {
            if (action.type == 'song' && action.args['section'] !== null ) {
                scrollTo(`#${action._id}-${action.args.section} .musicstand-chart:nth-child(${action.args.index+2})`);
            } else {
                scrollTo(`#action-${action._id}`);
            }
        }
    });
});

Template.musicstand.events({
    'click #scroll-lock': function (event, template) {
        $(event.currentTarget).toggleClass('active');
        if ($(event.currentTarget).hasClass('active'));
    }
});
