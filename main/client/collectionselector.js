Template.collectionSelector.helpers({
    collectionName: function () {
        return Template.parentData().collection._name;
    },
    
    filtered: function () {
        if (typeof this.filter == 'undefined') {
            this.filter = {};
            for (var i in this.fields) {
                this.filter[this.fields[i]] = new ReactiveVar(new RegExp('', 'i'));
            }
        }
        
        var values = {};
        for (var k in this.filter) {
            if (this.filter.hasOwnProperty(k)) values[k] = this.filter[k].get();
        }
        
        return this.collection.find(values);
    }
});

Template.collectionSelector.events({
    'keyup .collection-filter': function (event) {
        var filter = $(event.target).data('filter');
        Template.currentData().filter[filter].set(new RegExp($(event.target).val(), 'i'));
    }
});
