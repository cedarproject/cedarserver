Template.lightSettings.helpers({
    minions: function () {
        return minions.find({_id: {$ne: this.minion}, type: 'lighting'});
    },

    nameOf: function (minionid) {
        var minion = minions.findOne({_id: minionid});
        if (minion) {return minion.name;}
        else {return 'Unassigned';}
    },
    
    isState: function (state, retval) {
        if (this.enabled == state) return retval;
    }
});

Template.lightSettings.events({
    'click .channel-add': function (event) {
        var nc = this.channels;
        if (nc.length > 0) {
            var universe = nc[nc.length-1].universe;
            var address = nc[nc.length-1].address + 1;
        } else {
            var universe = 1;
            var address = 0;
        }
        
        nc.push({type: null, universe: universe, address: address});
        Meteor.call('lightChannels', this._id, nc);
    },
    
    'click .channel-del': function (event) {
        var i = Template.parentData().channels.indexOf(this);
        var nc = Template.parentData().channels;
        nc.splice(i, 1);
        Meteor.call('lightChannels', Template.parentData()._id, nc);
    },
        
    'click .light-delete': function (event) {
        $(event.target).parent().next('.delete-modal').modal('show');
    },
    
    'click .light-delete-cancel': function (event) {
        $(event.target).parents('.delete-modal').modal('hide');
    },
    
    'click .light-delete-confirm': function (event) {
        $(event.target).parents('.delete-modal').removeClass('fade').modal('hide');
        Meteor.call('lightDelete', this._id);
        Router.go('lights');
    },
    
    'click .light-cancel': function (event) {
        Router.go('lights');
    },
    
    'click .light-save': function (event) {
        blah = $(event.target);
        var title = $(event.target).siblings('.light-title').val();
        Meteor.call('lightTitle', this._id, title);
        
        var minion = $(event.target).siblings('.light-minion').val();
        Meteor.call('lightMinion', this._id, minion);
        
        if ($(event.target).parent().find('#enabled-true').prop('checked')) {
            Meteor.call('lightEnabled', this._id, true);
        } else {
            Meteor.call('lightEnabled', this._id, false);
        }
        
        var nc = this.channels;
        $(event.target).siblings('.light-channels').children().each(function (i, e) {
            nc[i].type = $(this).find('.channel-type').val();

            var universe = parseInt($(this).find('.channel-universe').val());
            if (!isNaN(universe) && universe >= 0) nc[i].universe = universe;
            
            var address = parseInt($(this).find('.channel-address').val());
            if (!isNaN(address) && address >= 0) nc[i].address = address;
            
            if (nc[i].type == 'fixed') {
                var value = parseFloat($(this).find('.channel-value').val());
                if (!isNaN(value) && value >= 0 && value <= 1) nc[i].value = value;
            }
        });
        
        Meteor.call('lightChannels', this._id, nc);
        
        Router.go('lights');
    }
});
