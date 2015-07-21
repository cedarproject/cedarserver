function checkConsole (consoleid) {
    var console = lightconsoles.findOne(consoleid);
    if (console) return console;
    else throw new Meteor.Error('console-not-found', "Couldn't find console with id: " + consoleid);
}

Meteor.methods({
    lightConsoleNew: function () {
        lightconsoles.insert({
            title: 'New Console',
            settings: {fade: 0},
            controls: []
        });
    },
    
    lightConsoleDel: function (consoleid) {
        var console = checkConsole(consoleid);
        lightconsoles.remove(console);
    },
    
    lightConsoleTitle: function (consoleid, title) {
        var console = checkConsole(consoleid);
        lightconsoles.update(console, {$set: {title: title}});
    },
    
    lightConsoleSetting: function (consoleid, setting, value) {
        var console = checkConsole(consoleid);
        var s = 'settings.' + setting;
        lightconsoles.update(console, {$set: {s: value}});
    },
    
    lightConsoleAddLight: function (consoleid, lightid) {
        var console = checkConsole(consoleid);
        lightconsoles.update(console, {$push: {controls: {light: lightid}}});
    },
    
    lightConsoleAddGroup: function (consoleid, groupid) {
        var console = checkConsole(consoleid);
        lightconsoles.update(console, {$push: {controls: {group: groupid}}});
    },
    
    lightConsoleAddScene: function (consoleid, sceneid) {
        var console = checkConsole(consoleid);
        lightconsoles.update(console, {$push: {controls: {scene: sceneid}}});
    },
    
    lightConsoleRemoveLight: function (consoleid, index) {
        var console = checkConsole(consoleid);
        lightconsoles.update(console, {$pull: {controls: console.controls[index]}});
    }
});
