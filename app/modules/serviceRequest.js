define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var ServiceRequest = app.module();

  // Default model.
  ServiceRequest.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  ServiceRequest.Collection = Backbone.Collection.extend({
    model: ServiceRequest.Model,
    sync: function(method, collection, options){
      //https://mayors24.cityofboston.gov/open311/v2/requests.json
      console.log(collection);
      if(method == "read"){
        $.ajax("http://localhost:3005/open311/v2/requests.json", {data:options.data, 
                                                                  dataType:"jsonp", 
                                                                  success:function(data){
                                                                      collection.add(data)
                                                                  }});
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
    sortByChange: function(ev){
        
    },
    nextResults: function(ev){

    },
    prevResults:function(ev){

    },
    cleanup: function() {
      //this.model.off(null, null, this);
    },
    initialize: function() {
      this.collection.on("change", this.render, this);
      //this.model.on("reset", this.render, this);
      this.collection.fetch();
    }
  });


  // Return the module for AMD compliance.
  return ServiceRequest;

});
