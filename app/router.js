define([
  // Application.
  "app",
  "modules/filter",
  "modules/serviceRequest",
  "modules/navigation",
  "modules/map",
  "modules/list",
  "modules/boundary"
],
function(app, Filter, ServiceRequest, Navigation, Map, List, Boundary) {

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
          filters:this.filters,
          boundaries:this.boundaries
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
    },
    initialize: function(){
      app.filters = this.filters = new Filter.Collection();
      this.serviceRequests = new ServiceRequest.Collection();
      this.boundaries = new Boundary.Collection();

      app.useLayout("main").render();

      app.layout.setViews({
        "#searchBox": new Filter.Views.Search({
          collection: this.filters
        }),
        "#results": new ServiceRequest.Views.Results({
          collection: this.serviceRequests
        }),
        "#subnav": new Navigation.Views.SubNav({
        }),
        "#filters": new Filter.Views.Controls({
          collection: this.filters,
        })

      });
      app.on("view_change", this.handleViewChanged, this);
      this.filters.on("add", function(){
        console.log(" on add reset service requests")
        this.serviceRequests.fetch();

      }, this);
      this.filters.on("change", function(){

        console.log(" on change reset service requests")
        this.serviceRequests.fetch();

      }, this);
      this.filters.on("remove", function(){

        console.log(" on change reset service requests")
        this.serviceRequests.fetch();

      }, this);

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
          filters:this.filters,
          boundaries:this.boundaries
        });
      }
      app.layout.setView("#content", loadview).render();
    }
  });

  return Router;

});
