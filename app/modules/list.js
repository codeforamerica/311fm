define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var List = app.module();

  List.Views.List = Backbone.View.extend({
    template:"list/base",
    tagName:"div",
    id:"list",
    events: {},

    afterRender: function(ev){ 
    },

    cleanup: function() {
    },
    initialize: function(e) {
      this.serviceRequests  = e.serviceRequests;
      this.filters = e.serviceRequests;
    }
  });

  // Return the module for AMD compliance.
  return List;

});
