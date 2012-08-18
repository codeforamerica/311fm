define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Filter = app.module();

  // Default model.
  Filter.Model = Backbone.Model.extend({});

  // Default collection.
  Filter.Collection = Backbone.Collection.extend({
    model: Filter.Model
  });

  Filter.Views.Search = Backbone.View.extend({
    template: "filter/search",

    tagName: "div",

    id: "searchBox",

    events: {
        "click .btn": "findLocation",
        "keypress #search": "enterSearch"
    },

    enterSearch: function(ev){
        if(ev.keyCode == 13)
            findLocation();
    },

    findLocation: function(ev) {
      var model = this.model;
      console.log($el.find("#search").val());

      //do search, and trigger add location event
      //app.router.go("org", org, "user", name);
    },

    cleanup: function() {
      this.model.off(null, null, this);
    },

    initialize: function() {
      this.collection.on("change", this.render, this);
      this.collection.on("reset", this.render, this);
    }
  });

  Filter.Views.Controls = Backbone.View.extend({
    template: "filter/controls",
    
    tagName: "div",

    id: "filters",
    
    events: {
      "onchange .services": "serviceChange",
      "click .status": "statusChange",
      "onchange .date": "dateChange",
      "click .addNewLocation": "newLocation",
      "click .removeLocation": "removeLocation"
    },

    serviceChange: function(ev){ /* TBD */ },

    statusChange: function(ev){ /* TBD */ },

    dateChange:function(ev){ /* TBD */ },

    newLocation: function(ev){ /* TBD */ },

    removeLocation: function(ev){ /* TBD */ },

    cleanup: function() {
      this.model.off(null, null, this);
    },

    initialize: function() {
      this.collection.on("change", this.render, this);
      this.collection.on("reset", this.render, this);
    }  
  });

  // Return the module for AMD compliance.
  return Filter;
});
