Template.minionsettingsdisplay.helpers({
    numBlocks: function () {
        return this.settings.blocks.length;
    },
    
    blockNum: function (block) {
        return Template.parentData().settings.blocks.indexOf(block);
    }
});

Template.displayforminput.helpers({
    get: function (attr) {
        return Template.parentData()[attr];
    }
});

Template.minionsettingsdisplay.events({
    'click .add-block': function (event) {
        var blocks = this.settings.blocks;
        blocks.push({left: 0, right: 0, top: 0, bottom: 0,
                     'post-left': 0, 'post-right': 0, 'post-top': 0, 'post-bottom': 0,
                     'translation-x': 0, 'translation-y': 0, 'translation-z': 0,
                     'rotation-x': 0, 'rotation-y': 0, 'rotation-z': 0,
                     'scale-x': 1, 'scale-y': 1,
                     xpos: 0, ypos: 0, zorder: blocks.length});
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

        blocks[row.data('blocknum')] = {
            left: parseInt(row.find('.disp-left').val()) || 0,
            right: parseInt(row.find('.disp-right').val()) || 0,
            top: parseInt(row.find('.disp-top').val()) || 0,
            bottom: parseInt(row.find('.disp-bottom').val()) || 0,
            'post-left': parseInt(row.find('.disp-post-left').val()) || 0,
            'post-right': parseInt(row.find('.disp-post-right').val()) || 0,
            'post-top': parseInt(row.find('.disp-post-top').val()) || 0,
            'post-bottom': parseInt(row.find('.disp-post-bottom').val()) || 0,
            'translation-x': parseFloat(row.find('.disp-trans-x').val()) || 0,
            'translation-y': parseFloat(row.find('.disp-trans-y').val()) || 0,
            'translation-z': parseFloat(row.find('.disp-trans-z').val()) || 0,
            'rotation-x': parseFloat(row.find('.disp-rot-x').val()) || 0,
            'rotation-y': parseFloat(row.find('.disp-rot-y').val()) || 0,
            'rotation-z': parseFloat(row.find('.disp-rot-z').val()) || 0,
            'scale-x': parseFloat(row.find('.disp-scale-x').val()) || 0,
            'scale-y': parseFloat(row.find('.disp-scale-y').val()) || 0,
            xpos: parseInt(row.find('.disp-xpos').val()) || 0,
            ypos: parseInt(row.find('.disp-ypos').val()) || 0,
            zorder: parseInt(row.find('.disp-zorder').val()) || 0
        };

        Meteor.call('minionSetting', this._id, 'blocks', blocks);
    }
});
