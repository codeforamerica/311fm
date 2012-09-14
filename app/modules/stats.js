define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Stats = app.module();

  // Default model.
  Stats.Model = Backbone.Model.extend({
    
  });

  // Default collection.
  Stats.Collection = Backbone.Collection.extend({
    model: Stats.Model
  });

  // Return the module for AMD compliance.
  return Stats;

});
