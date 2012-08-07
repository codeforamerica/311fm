define([
  // Application.
  "app",
  "modules/location",
  "modules/filter",
  "modules/serviceRequest"
],

       function(app, Location, Filter, ServiceRequest) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
        this.reset();
        app.useLayout("main").render();
        
    },
    reset: function(){

    },
    initialize: function(){

      this.location = new Location.Model();
      this.filter = new Filter.Model();
      this.serviceRequest = new ServiceRequest.Model();
      app.useLayout("main");


      //these should be a collection
      app.layout.setViews({
        "#searchBox": new Location.Views.Search({
          model: this.location
        }),
        "#locationFilter": new Location.Views.Filter({
          model: this.location
        }),
        "#filters": new Filter.Views.Controls({
          model: this.filter
        }),
        "#results": new ServiceRequest.Views.Results({
          model: this.serviceRequest  
        })

      });
    }
  });

  return Router;

});
