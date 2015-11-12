Template.songDisplay.helpers({
    content: function () {
        var contents = [];
        this.arrangement.order.forEach((_id, i) => {
            var section = songsections.findOne(_id);
            for (var c in section.contents) {
                var content = section.contents[c];
                content.section = i;
                content.index = c;
                content.action = this.action;
                contents.push(content);
            }
        });

        return contents;
    },
    
    getText: function () {
        return songTextToHTML(this.text);
    },
    
    isActive: function () {
        var action = Template.parentData(2);
        if (action['args']) {
            if (this.section == action.args.section && this.index == action.args.index) return 'active';
        }
    }
});
