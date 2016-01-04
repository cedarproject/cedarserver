Template.setSidebar.helpers({
    actions: function () {
        return actions.find({set: Template.parentData()._id}, {sort: {order: 1}});
    },

    getLayers: function () {
        if (this.stage) return stages.findOne({_id: this.stage}).settings.layers;
    }
});

Template.setSidebar.events({
    'click #sidebar-toggle': function (event, template) {
        template.$('#sidebar').toggleClass('sidebar-open');
    },
    
    'click #set-lock': function (event, template) {
        if (Session.get('set-control-locked')) {
            Session.set('set-control-locked', false);
            template.$('#set-lock').removeClass('btn-danger')
                .removeClass('active').addClass('btn-default')
                .html('<span class="glyphicon glyphicon-lock"></span>Lock');
        } else {
            Session.set('set-control-locked', true);
            template.$('#set-lock').removeClass('btn-default')
                .addClass('btn-danger').addClass('active')
                .html('<span class="glyphicon glyphicon-lock"></span>Unlock');
        }
    }
});
