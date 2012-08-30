define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var ServiceRequest = app.module();

  // Default model.
  ServiceRequest.Model = Backbone.Model.extend({});

  // Default collection.
  ServiceRequest.Collection = Backbone.Collection.extend({
    model: ServiceRequest.Model,
    filterParams: function(){
      var params = {};
      for( m in app.filters.models){
        var filter = app.filters.models[m];
        
        console.log(filter);
        params[filter.get("name")] = filter.get("value");
      }
      return params;
    },
    sync: function(method, collection, options){
      collection.reset()
      var url = "http://open311proxy.herokuapp.com/open311/v2/requests.json"
      console.log("filters",options.data, this.filterParams())
      if(method == "read"){
        $.ajax(url, {data:_.extend(this.filterParams(), options.data), 
          dataType:"jsonp",
          success:function(data) {
            collection.add(data);
            collection.trigger("change");
          },
          error:function(err,b,c) {
            console.log(err,b,c);
          }
        }, "json");
      }
    }
  });

  ServiceRequest.Views.Results = Backbone.View.extend({
    template: "serviceRequest/results",

    tagName: "div",

    id: "results",

    events: {
        "onchange .sortBy": "sortByChange",
        "click .next": "nextResults",
        "click .prev": "prevResults"
    },

    sortByChange: function(ev){},

    nextResults: function(ev){},

    prevResults:function(ev){},

    cleanup: function() {
      //this.model.off(null, null, this);
    },

    serialize: function(){
      return {collection:this.collection};
    },

    initialize: function() {
      this.collection.on("change", this.render, this);
      this.collection.on("add", this.render, this);
      //this.model.on("reset", this.render, this);
      this.collection.fetch();
    }
  });

  // Return the module for AMD compliance.
  return ServiceRequest;
});
