define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Compare = app.module();

  Compare.Views.Compare = Backbone.View.extend({
    template:"compare/base",
    tagName:"div",
    id:"compare",
    events: {},

    afterRender: function(ev){ 
    },

    cleanup: function() {
      this.stats.off(null, null, this);
      app.off(null, null, this);
    },
    serialize: function(){
      return {stats:this.stats};
    },
    initialize: function(o) {
      this.filters = o.filters;
      this.stats = o.stats;
      this.stats.on("reset", this.render, this);
      this.stats.on("change", this.render, this);
      this.stats.on("add", this.render, this);
      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
    }
  });

  // Return the module for AMD compliance.
  return Compare;

});
