var block_props = [
    {prop: 'x', def: 0, title: 'X', min: 0, max: 1, step: 0.01},
    {prop: 'y', def: 0, title: 'Y', min: 0, max: 1, step: 0.01},
    {prop: 'width', def: 1, title: 'Width', min: 0, max: 1, step: 0.01},
    {prop: 'height', def: 1, title: 'Height', min: 0, max: 1, step: 0.01},
    {prop: 'transx', def: 0, title: 'X', min: -1, max: 1, step: 0.01},
    {prop: 'transy', def: 0, title: 'Y', min: -1, max: 1, step: 0.01},
    {prop: 'transz', def: 0, title: 'Z', min: -1, max: 1, step: 0.01},
    {prop: 'rotx', def: 0, title: 'X', min: -10, max: 10, step: 0.01},
    {prop: 'roty', def: 0, title: 'Y', min: -10, max: 10, step: 0.01},
    {prop: 'rotz', def: 0, title: 'Z', min: -10, max: 10, step: 0.01},
    {prop: 'scalex', def: 1, title: 'X', min: 0, max: 10, step: 0.01},
    {prop: 'scaley', def: 1, title: 'Y', min: 0, max: 10, step: 0.01},
    {prop: 'skewx', def: 0, title: 'X', min: -10, max: 10, step: 0.01},
    {prop: 'skewy', def: 0, title: 'Y', min: -10, max: 10, step: 0.01}
];

var block_groups = [
    {heading: 'Source', props: block_props.slice(0, 4)},
    {heading: 'Translate', props: block_props.slice(4, 7)},
    {heading: 'Rotate', props: block_props.slice(7, 10)},
    {heading: 'Scale', props: block_props.slice(10, 12)},
    {heading: 'Skew', props: block_props.slice(12, 14)}
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
    get: function (attr) {
        return Template.parentData(2)[attr];
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
            blocks[row.data('blocknum')][prop] = parseFloat(row.find('.disp-' + prop).val()) || def;
        }

        Meteor.call('minionSetting', this._id, 'blocks', blocks);
    }
});
