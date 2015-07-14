var items_per_page = 10;

Template.collectionSelector.helpers({
    collectionName: function () {
        return Template.parentData().collection._name;
    },
    
    getPages: function () {
        return this.pages.get();
    },
    
    activePage: function () {
        if (parseInt(this) == Template.parentData().page.get()) return 'active';
    },
    
    filtered: function () {
        var values = {};
        for (var k in this.filter) {
            if (this.filter.hasOwnProperty(k)) values[k] = this.filter[k].get();
        }
        
        return this.collection.find(values, 
            {skip: (this.page.get() - 1) * items_per_page, limit: items_per_page}
        );
    }
});

Template.collectionSelector.onCreated(function () {
    var t = Template.currentData();
    t.filter = {};
    for (var i in t.fields) {
        t.filter[t.fields[i]] = new ReactiveVar(new RegExp('', 'i'));
    }
    
    t.page = new ReactiveVar(1);
    t.pages = new ReactiveVar([]);
    
    this.autorun(function () {
        var t = Template.currentData();
        var values = {};
        for (var k in t.filter) {
            if (t.filter.hasOwnProperty(k)) values[k] = t.filter[k].get();
        }
        
        var p = [];
        for (var n = 1; n <= Math.ceil(t.collection.find(values).count() / items_per_page); n++) {
            p.push(n);
        }
        
        t.pages.set(p);
    });
});

Template.collectionSelector.events({
    'keyup .collection-filter': function (event) {
        var filter = $(event.target).data('filter');
        Template.currentData().filter[filter].set(new RegExp($(event.target).val(), 'i'));
    },
    
    'click .pagenum': function (event, template) {
        template.data.page.set(this);
    },
    
    'click #pageprev': function (event, template) {
        if (template.data.page.get() > 1)
            template.data.page.set(template.data.page.get() - 1);
    },
    
    'click #pagenext': function (event, template) {
        if (template.data.page.get() < template.data.pages.get().length)
            template.data.page.set(template.data.page.get() + 1);
    }
});
