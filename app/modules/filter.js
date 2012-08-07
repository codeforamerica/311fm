define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Filter = app.module();

  // Default model.
  Filter.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  Filter.Collection = Backbone.Collection.extend({
    model: Filter.Model
  });


  Filter.Views.Controls = Backbone.View.extend({
    template: "filter/controls",

    tagName: "div",
    id: "filters",

    events: {
        "onchange .services": "serviceChange",
        "click .status": "statusChange",
        "onchange .date": "dateChange"
    },
    serviceChange: function(ev){
        
    },
    statusChange: function(ev){

    },
    dateChange:function(ev){

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
  return Filter;

});
