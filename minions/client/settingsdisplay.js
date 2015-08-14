// All hope abandon, ye who enter here...
// Yeah, I'm not particularly proud of this code. It started as a nice idea to avoid having to edit the code for a dozen HTML inputs whenever I made a change, but then I found I needed to edit values from an array...

var block_props = [
    {prop: 'x', def: 0, title: 'X', min: 0, max: 1, step: 0.01},
    {prop: 'y', def: 0, title: 'Y', min: 0, max: 1, step: 0.01},
    {prop: 'width', def: 1, title: 'Width', min: 0, max: 1, step: 0.01},
    {prop: 'height', def: 1, title: 'Height', min: 0, max: 1, step: 0.01},
    {prop: 'brightness', def: 1, title: 'Brightness', min: 0, max: 2, step: 0.01},
    {prop: 'block-0-0', def: -1, title: 'X', min: -1, max: 1, step: 0.001},
    {prop: 'block-0-1', def: 1, title: 'Y', min: -1, max: 1, step: 0.001},
    {prop: 'block-1-0', def: 1, title: 'X', min: -1, max: 1, step: 0.001},
    {prop: 'block-1-1', def: 1, title: 'Y', min: -1, max: 1, step: 0.001},
    {prop: 'block-2-0', def: -1, title: 'X', min: -1, max: 1, step: 0.001},
    {prop: 'block-2-1', def: -1, title: 'Y', min: -1, max: 1, step: 0.001},
    {prop: 'block-3-0', def: 1, title: 'X', min: -1, max: 1, step: 0.001},
    {prop: 'block-3-1', def: -1, title: 'Y', min: -1, max: 1, step: 0.001},
];

var block_groups = [
    {heading: 'Source', props: block_props.slice(0, 5)},
    {heading: 'Top-Left', props: block_props.slice(5, 7)},
    {heading: 'Top-Right', props: block_props.slice(7, 9)},
    {heading: 'Bottom-Left', props: block_props.slice(9, 11)},
    {heading: 'Bottom-Right', props: block_props.slice(11, 13)}
];

Template.minionsettingsdisplay.helpers({
    numBlocks: function () {
        if (this.settings['blocks']) return this.settings.blocks.length;
        else return 0;
    },
    
    blockNum: function (block) {
        return Template.parentData().settings.blocks.indexOf(block);
    },
    
    blockGroups: function () {
        return block_groups;
    },
    get: function (prop) {
        if (prop.split('-')[0] == 'block') {
            // Also an ugly hack, TODO find a better way to do this...
            var c = prop.split('-');
            return Template.parentData(2).points[parseInt(c[1])][parseInt(c[2])];
        }
        else return Template.parentData(2)[prop];
    }
});

Template.minionsettingsdisplay.events({
    'click .add-block': function (event) {
        var blocks = this.settings['blocks'] || [];
        
        var block = {};
        for (var i = 0; i < block_props.length; i++) {
            block[block_props[i].prop] = block_props[i].def;
        }
        
        blocks.push(block);
        Meteor.call('minionSetting', this._id, 'blocks', blocks);
    },

    'click .del-block': function (event) {
        var blocks = this.settings.blocks;
        if (blocks.length > 1) {
            blocks.pop();
            Meteor.call('minionSetting', this._id, 'blocks', blocks);
        }
    },
    
    'input .block-list': function (event) {
        var blocks = this.settings.blocks;
        var row = $(event.target).parents('.row');

        for (var i = 0; i < block_props.length; i++) {
            var prop = block_props[i].prop;
            var def = block_props[i].def;
            
            if (prop.split('-')[0] == 'block') {
                // Also an ugly hack, TODO find a better way to do this...
                var c = prop.split('-');
                blocks[row.data('blocknum')].points[parseInt(c[1])][parseInt(c[2])] = parseFloat(row.find('.disp-' + prop).val()) || def;
            }
            
            blocks[row.data('blocknum')][prop] = parseFloat(row.find('.disp-' + prop).val()) || def;
        }

        Meteor.call('minionSetting', this._id, 'blocks', blocks);
    }
});
