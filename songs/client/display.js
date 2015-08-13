Template.songDisplay.helpers({
    content: function () {
        var contents = [];
        for (var _id in this.arrangement.order) {
            var section = songsections.findOne(this.arrangement.order[_id]);
            for (var c in section.contents) {
                var content = section.contents[c];
                content.section = section._id;
                content.index = c;
                content.number = contents.length;
                content.action = this.action;
                contents.push(content);
            }
        }
        return contents;
    },
    
    getText: function () {
        return songTextToHTML(this.text);
    },
    
    isActive: function () {
        var action = Template.parentData(2);
        if (action['args']) {
            if (this.number == action.args.number) return 'active';
        }
    }
});
