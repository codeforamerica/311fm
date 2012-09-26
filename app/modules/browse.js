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
      this.serviceRequests.off(null, null, this);
      app.off(null, null, this);
    },
    serialize: function(){
      return {serviceRequests:this.serviceRequests.toJSON()}
    },
    initialize: function(o) {
      this.filters = o.filters;
      this.serviceRequests  = o.serviceRequests;
      this.serviceRequests.on("reset", this.render, this);
      this.serviceRequests.on("change", this.render, this);
      this.serviceRequests.on("add", this.render, this);

      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
    }
  });

  // Return the module for AMD compliance.
  return Browse;

});
