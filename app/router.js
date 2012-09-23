define([
  // Application.
  "app",
  "modules/filter",
  "modules/serviceRequest",
  "modules/navigation",
  "modules/map",
  "modules/list",
  "modules/boundary",
  "modules/city",
  "modules/graphs",
  "modules/compare",
  "modules/browse",
  "modules/stats"
],
function(app, Filter, ServiceRequest, Navigation, Map, List, Boundary, City, Graphs, Compare, Browse, Stat) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "map": "map",
      "list": "list",
      "graphs": "graphs",
      "compare": "compare",
      "browse": "browse"
    },
    index: function() {
      this.map();
    },
    map: function(){
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
      app.layout.setView("#content", new Graphs.Views.Graphs({
        serviceRequests:this.serviceRequests,
        filters:this.filters
      })).render();
      app.trigger("view_change", {view:"graphs"});
    },
    compare: function(){
      app.layout.setView("#content", new Compare.Views.Compare({
        serviceRequests:this.serviceRequests,
        filters:this.filters,
        stats:this.stats
      })).render();
      app.trigger("view_change", {view:"compare"});
    },
    browse: function(){
      app.layout.setView("#content", new Browse.Views.Browse({
        serviceRequests:this.serviceRequests,
        filters:this.filters
      })).render();
      app.trigger("view_change", {view:"browse"});
    },
    initialize: function(){
      app.filters = this.filters = new Filter.Collection();
      this.serviceRequests = new ServiceRequest.Collection();
      this.boundaries = new Boundary.Collection();
      this.cities = new City.Collection();
      this.stats =  new Stat.Collection();
      app.useLayout("main");

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

      }).render();
      app.on("view_change", this.handleViewChanged, this);
      this.filters.on("add", function(){
        this.serviceRequests.fetch();
      }, this);
      this.filters.on("change", function(){
        this.serviceRequests.fetch();
      }, this);
      this.filters.on("remove", function(){
        this.serviceRequests.fetch();
      }, this);
      app.on("city_changed", function(city){
        if(city)
          $("#cityName").html(city.get("name"));
        else
          $("#cityName").html("");
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
          boundaries:this.boundaries,
          cities:this.cities
        });
      }else if(ev.view == "compare"){
        loadview  = new Compare.Views.Compare({
          serviceRequests:this.serviceRequests,
          filters:this.filters,
          stats:this.stats
        });
      }else if(ev.view == "graphs"){
        loadview  = new Graphs.Views.Graphs({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        });
      }else if(ev.view == "browse"){
        loadview  = new Browse.Views.Browse({
          serviceRequests:this.serviceRequests,
          filters:this.filters
        });
      }
      app.layout.setView("#content", loadview).render();
    }
  });

  return Router;

});
