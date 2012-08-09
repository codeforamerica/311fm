define([
  // Application.
  "app",
  "modules/filter",
  "modules/serviceRequest"
],

function(app, Filter, ServiceRequest) {

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

      this.filter = new Filter.Model();
      this.serviceRequest = new ServiceRequest.Collection();
      app.useLayout("main");


      //these should be a collection
      app.layout.setViews({
        "#searchBox": new Filter.Views.Search({
          model: this.filter
        }),
        "#filters": new Filter.Views.Controls({
          model: this.filter
        }),
        "#results": new ServiceRequest.Views.Results({
          collection: this.serviceRequest  
        })

      });
    }
  });

  return Router;

});
