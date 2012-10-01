define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Pages = app.module();

  Pages.Views.About = Backbone.View.extend({
    template:"about",

    events: {},

    afterRender: function(ev){ 
    },

    cleanup: function() {

    },
    initialize: function(e) {

    }
  });

  // Return the module for AMD compliance.
  return Pages;

});
