Template.lightConsolePanel.helpers({
    isHidden: function () {
        if (Template.currentData().hasOwnProperty('_id')) var id = Template.currentData()._id;
        else var id = Template.parentData()._id;

        if (!Session.get(`panel-edit-${id}`)) return 'hidden';
    },
    
    getControls: function () {
        var out = [];
        this.controls.forEach((c, i) => {
            c.index = i;
            out.push(c);
        });
        
        return out;
    },

    getLight: function (lightid) {
        return lights.findOne(lightid);
    },

    getGroup: function (groupid) {
        return lightgroups.findOne(groupid);
    },

    getScene: function (sceneid) {
        return lightscenes.findOne(sceneid);
    }
});

Template.lightConsolePanel.onCreated(function () {
    Session.set(`panel-edit-${this.data._id}`, false);
});

Template.lightConsolePanel.events({
    'click .panel-edit-toggle': function (event, template) {
        $(event.target).toggleClass('active');
        Session.set(`panel-edit-${template.data._id}`, !Session.get(`panel-edit-${template.data._id}`));
    },
    
    'blur .panel-title': function (event, template) {
        Meteor.call('lightConsolePanelTitle', template.data._id, $(event.target).val());
    },
    
    'click .add-control': function (event, template) {
        Session.set('add-to', template.data._id);
    },
    
    'click .control-down': function (event, template) {
        var controls = template.data.controls;
        if (this.index < controls.length-1) {
            controls.splice(this.index+1, 0, controls.splice(this.index, 1)[0]);
            Meteor.call('lightConsolePanelControls', template.data._id, controls);
        }
    },

    'click .control-up': function (event, template) {
        var controls = template.data.controls;
        if (this.index > 0) {
            controls.splice(this.index-1, 0, controls.splice(this.index, 1)[0]);
            Meteor.call('lightConsolePanelControls', template.data._id, controls);
        }
    },
    
    'click .control-del': function (event, template) {
        var controls = template.data.controls;
        controls.splice(this.index, 1);
        Meteor.call('lightConsolePanelControls', template.data._id, controls);
    },
    
    'click .panel-del': function (event, template) {
        Meteor.call('lightConsoleDelPanel', template.data._id);
    }
});
