define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Browse = app.module();

  Browse.Views.Browse = Backbone.View.extend({
    template:"browse/base",
    tagName:"div",
    id:"browse",
    events: {},

    afterRender: function(ev){ 
    },

    cleanup: function() {
      app.off(null, null, this);
    },
    serialize: function(){

    },
    initialize: function(o) {
      this.filters = o.filters;

      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
    }
  });

  // Return the module for AMD compliance.
  return Browse;

});
