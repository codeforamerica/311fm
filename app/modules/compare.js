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

    initialize: function() {},

    _ready: function() {
      if (undefined !== this.get("stats")) {
        return true;
      }

      return false;
    },

    avgDaysToCloseRequests: function() {
      if (this._ready()) {
        return Math.round(this.get("stats").days_to_close_requests_avg);
      }
    }
  });

  Compare.Views.Area = Backbone.View.extend({
    template: "compare/area",
    id: "area",

    serialize: function () {
      //console.log(this.model);

      return {
        modelA_ward: this.model.modelA.get("ward"),
        modelA_stats: this.model.modelA.get("stats"),
        modelA_avgDays: this.model.modelA.avgDaysToCloseRequests(),
        modelB_ward: this.model.modelB.get("ward"),
        modelB_stats: this.model.modelB.get("stats"),
        modelB_avgDays: this.model.modelB.avgDaysToCloseRequests()
      };
    },

    initialize: function() {
      // XXX: "off"s should be in cleanup but cannot due to multiple loads of view stack by router
      this.model.modelA.off("change");
      this.model.modelA.on("change", this.render, this);
      this.model.modelB.off("change");
      this.model.modelB.on("change", this.render, this);
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
        console.log(e.currentTarget.value);
        this.modelA.url = "http://freaky-mustard-data.herokuapp.com/api/v1/" +
          e.currentTarget.value +
          "/summary?start=2004-09-01&end=2012-09-12&callback=?";
        this.modelA.fetch({success: this.modelA.successCallback, error: this.modelA.errorCallback});
      },
      "change #slAreaB" : function(e) {
        this.modelB.url = "http://freaky-mustard-data.herokuapp.com/api/v1/" +
          e.currentTarget.value +
          "/summary?start=2004-09-01&end=2012-09-12&callback=?";
        this.modelB.fetch({success: this.modelB.successCallback, error: this.modelB.errorCallback});
      }
    },

    beforeRender: function(ev) {
      this.insertView(".areas", new Compare.Views.Area({
        model: {modelA: this.modelA, modelB: this.modelB}
      }));
    },

    afterRender: function(ev) {},

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
