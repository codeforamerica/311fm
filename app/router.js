define([
  // Application.
  "app",
  "modules/filter",
  "modules/serviceRequest",
  "modules/navigation",
  "modules/map",
  "modules/list"
],

       function(app, Filter, ServiceRequest, Navigation, Map, List) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "map": "map",
      "list": "list",
      "graphs": "graphs"
    },
    index: function() {
      this.map();
    },
    map: function(){
      app.layout.setViews({
        "#content": new Map.Views.Map({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        })
      }).render();
      app.trigger("view_change", {view:"map"});
    },
    list: function(){
      app.layout.setViews({
        "#content": new List.Views.List({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        })
      }).render();
      app.trigger("view_change", {view:"list"});
    },
    graphs: function(){
      app.layout.setView("#content", new List.Views.List({
        serviceRequests:this.serviceRequests,
        filters:this.filters
      })).render();
      app.trigger("view_change", {view:"graphs"});
      //app.layout.setViews({
      //  "#content": 
      //}).render();
    },
    initialize: function(){
      this.filters = new Filter.Collection();
      this.serviceRequest = new ServiceRequest.Collection();
      app.useLayout("main").render();

      //these should be a collection
      app.layout.setViews({
        "#searchBox": new Filter.Views.Search({
          collection: this.filters
        }),
        "#results": new ServiceRequest.Views.Results({
          collection: this.serviceRequest  
        }),
        "#subnav": new Navigation.Views.SubNav({
        }),
        "#filters": new Filter.Views.Controls({
          collection: this.filters,
        })

      });
      app.on("view_change", this.handleViewChanged, this);
    },
    handleViewChanged: function(ev){
      console.log("view changed", ev);
      var loadview;
      if(ev.view == "list"){
        loadview  = new List.Views.List({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        });
      }else if(ev.view == "map"){
        loadview  = new Map.Views.Map({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        });
      }
      app.layout.setView("#content", loadview).render();
    }
  });

  return Router;

});
