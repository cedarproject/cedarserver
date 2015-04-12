Template.minionsettingsdisplay.helpers({
    numBlocks: function () {
        return this.settings.blocks.length;
    },
    
    blockNum: function (block) {
        return Template.parentData().settings.blocks.indexOf(block);
    }
});

Template.minionsettingsdisplay.events({
    'click .add-block': function (event) {
        var blocks = this.settings.blocks;
        blocks.push({left: 0, right: 0, top: 0, bottom: 0,
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
            left: row.find('.disp-left').val(),
            right: row.find('.disp-right').val(),
            top: row.find('.disp-top').val(),
            bottom: row.find('.disp-bottom').val(),
            'translation-x': row.find('.disp-trans-x').val(),
            'translation-y': row.find('.disp-trans-y').val(),
            'translation-z': row.find('.disp-trans-z').val(),
            'rotation-x': row.find('.disp-rot-x').val(),
            'rotation-y': row.find('.disp-rot-y').val(),
            'rotation-z': row.find('.disp-rot-z').val(),
            'scale-x': row.find('.disp-scale-x').val(),
            'scale-y': row.find('.disp-scale-y').val(),
            xpos: row.find('.disp-xpos').val(),
            ypos: row.find('.disp-ypos').val(),
            zorder: row.find('.disp-zorder').val()
        };

        Meteor.call('minionSetting', this._id, 'blocks', blocks);
    }
});
