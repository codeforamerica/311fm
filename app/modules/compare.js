define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Compare = app.module();

  // Default model.
  Compare.Model = Backbone.Model.extend({

    successCallback: function(model, response) {
      model.trigger("loaded", model);
    },

    errorCallback: function(model, response) {
      console.log(response);
    },

    initialize: function() {}

  });

  Compare.Views.Area = Backbone.View.extend({
    template: "compare/area",
    id: "area",

    initialize: function() {
      // XXX: This "off" call should be in cleanup but cannot be due to multiple loads of view stack by router
      this.model.off("change");
      this.model.on("change", function(model) {
        console.log(model);
      });
    }
  });

  Compare.Views.Compare = Backbone.View.extend({
    template:"compare/base",
    tagName:"div",
    id:"compare",

    modelA: new Compare.Model(),
    modelB: new Compare.Model(),
 
    events: {
      "change #slAreaA" : function(e) {
        this.modelA.url = "http://freaky-mustard-data.herokuapp.com/api/v1/37/summary?start=2012-09-01&end=2012-09-12&callback=?";
        this.modelA.fetch({success: this.modelA.successCallback, error: this.modelA.errorCallback});
      },
      "change #slAreaB" : function(e) {
        this.modelB.url = "http://freaky-mustard-data.herokuapp.com/api/v1/47/summary?start=2012-09-01&end=2012-09-12&callback=?";
        this.modelB.fetch({success: this.modelB.successCallback, error: this.modelB.errorCallback});
      }
    },

    beforeRender: function(ev){
      this.insertView(".areaA", new Compare.Views.Area({model: this.modelA}));
      this.insertView(".areaB", new Compare.Views.Area({model: this.modelB}));
    },

    afterRender: function(ev){},

    cleanup: function() {
      this.stats.off(null, null, this);
      app.off(null, null, this);
    },

    serialize: function() {
      var areas = [];
      // 50 wards are our areas for now...
      for (var i=1; i<=50; i++) {
        areas.push(i);
      }
      return {
        stats: this.stats,
        areas: areas
      };
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
