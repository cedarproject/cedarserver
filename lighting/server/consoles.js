function checkConsole (consoleid) {
    var console = lightconsoles.findOne(consoleid);
    if (console) return console;
    else throw new Meteor.Error('console-not-found', `Couldn't find console with id: ${consoleid}`);
}

function checkPanel (panelid) {
    var panel = lightconsolepanels.findOne(panelid);
    if (panel) return panel;
    else throw new Meteor.Error('panel-not-found', `Couldn't find panel with id: ${panelid}`);
}

Meteor.methods({
    lightConsoleNew: function () {
        return lightconsoles.insert({
            title: 'New Console',
            stage: null,
            settings: {fade: 0},
        });
    },
    
    lightConsoleDel: function (consoleid) {
        var console = checkConsole(consoleid);
        lightconsoles.remove(consoleid);
        lightconsolepanels.remove({console: consoleid});
    },
    
    lightConsoleTitle: function (consoleid, title) {
        var console = checkConsole(consoleid);
        lightconsoles.update(console, {$set: {title: title}});
    },
    
    lightConsoleStage: function (consoleid, stage) {
        var console = checkConsole(consoleid);
        lightconsoles.update(console, {$set: {stage: stage}});
    },
    
    lightConsoleSetting: function (consoleid, setting, value) {
        var console = checkConsole(consoleid);
        var s = {}; s['settings.' + setting] = value;
        lightconsoles.update(console, {$set: s});
    },
    
    lightConsoleAddPanel: function (consoleid) {
        var console = checkConsole(consoleid);
        var o = lightconsolepanels.find({console: consoleid}).count();
        return lightconsolepanels.insert({
            console: consoleid,
            title: 'New Panel',
            order: o,
            settings: {},
            controls: []
        });
    },
    
    lightConsoleDelPanel: function (panelid) {
        var panel = checkPanel(panelid);
        lightconsolepanels.remove(panelid);
        lightconsolepanels.update({console: panelid, order: {$gt: panel.order}}, {$inc: {order: -1}}, {multi: true});
    },
    
    lightConsolePanelTitle: function (panelid, title) {
        var panel = checkPanel(panelid);
        lightconsolepanels.update(panel, {$set: {title: title}});
    },
    
    lightConsolePanelControls: function (panelid, controls) {
        var panel = checkPanel(panelid);
        lightconsolepanels.update(panel, {$set: {controls: controls}});
    },
});
