define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Location = app.module();

  // Default model.
  Location.Model = Backbone.Model.extend({
      
  });

  // Default collection.
  Location.Collection = Backbone.Collection.extend({
    model: Location.Model
  });

  Location.Views.Search = Backbone.View.extend({
    template: "location/search",

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
/*    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },*/

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
      this.model.on("change", this.render, this);
      this.model.on("reset", this.render, this);
    }
  });
  Location.Views.Filter = Backbone.View.extend({
    template: "location/filter",

    tagName: "div",
    id: "locationFilter",

    events: {
        "click .addNewLocation": "newLocation",
        "click .removeLocation": "removeLocation"
    },
    newLocation: function(ev){
        
    },
    removeLocation: function(ev){

    },
    cleanup: function() {
      this.model.off(null, null, this);
    },

    initialize: function() {
      this.model.on("change", this.render, this);
      this.model.on("reset", this.render, this);
    }
  });

  // Return the module for AMD compliance.
  return Location;

});
