define([
  // Application.
  "app",
  "modules/filter",
  "modules/serviceRequest",
  "modules/navigation",
  "modules/map"
],

function(app, Filter, ServiceRequest, Navigation, Map) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "map": "map",
      "list": "list"
    },
    index: function() {
        this.reset();
        app.useLayout("main").render();
        
    },
    map: function(){
      app.layout.setViews({
        "#content": new Map.Views.Map({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        })
      });
    },
    list: function(){
      app.layout.setViews({
        "#content": new Map.Views.Map({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        })
      });
    },

    reset: function(){

    },
    initialize: function(){

      this.filters = new Filter.Collection();
      this.serviceRequest = new ServiceRequest.Collection();
      app.useLayout("main");

      //these should be a collection
      app.layout.setViews({
        "#searchBox": new Filter.Views.Search({
          collection: this.filters
        }),

        "#filters": new Filter.Views.Controls({
          collection: this.filters
        }),
        "#results": new ServiceRequest.Views.Results({
          collection: this.serviceRequest  
        }),
        "#subnav": new Navigation.Views.SubNav({})
      });
      this.map();
    }
  });

  return Router;

});
