define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Graphs = app.module();

  Graphs.Views.Graphs = Backbone.View.extend({
    template:"graphs/base",
    tagName:"div",
    id:"graphs",
    events: {},

    afterRender: function(ev){ 
    },

    cleanup: function() {
      //this.stats.off(null, null, this);
      app.off(null, null, this);
    },
    serialize: function(){
      //return {stats:this.stats};
    },
    initialize: function(o) {
      this.filters = o.filters;
      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
    }
  });

  // Return the module for AMD compliance.
  return Graphs;

});
