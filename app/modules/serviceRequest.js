define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var ServiceRequest = app.module();

  // Default model.
  ServiceRequest.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  ServiceRequest.Collection = Backbone.Collection.extend({
    model: ServiceRequest.Model
  });

  // Return the module for AMD compliance.
  return ServiceRequest;

});
