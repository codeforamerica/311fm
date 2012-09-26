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
        params[filter.get("name")] = filter.get("value");
      }
      return params;
    },
    sync: function(method, collection, options){
      var filterParams = this.filterParams();
      filterParams.page_size = 200;
      
      if(!options.data)
        options.data = {};

      if(method == "read"){
        collection.reset();
        app.cities.each(function(city){
          var dataType = "xml";
          if(city.get("supports_json"))
            dataType = "json";
          if(city.get("include_jurisdiction_id"))
            options.data.jurisdiction_id = city.get("jurisdiction_id");
          else{
            delete options.data.jurisdiction_id;
            delete filterParams.jurisdiction_id;
          }
          var url = "http://open311proxy.herokuapp.com/open311/"+city.get("jurisdiction_id")+"/requests."+dataType;
          $.ajax(url, {data:_.extend(filterParams, options.data),
                       dataType:dataType,
                       success:function(data) {
                         
                         if(typeof(data).toString() == "Array"){
                           
                         }else{
                           var requests
                           var r =  $(data).find("request");
                           //r.

                         }


                         for(d in data){
                           data[d].city = city.get("name");
                         }
                         collection.add(data, {silent:true});
                         collection.trigger("add");
                       },
                       error:function(err,b,c) {
                         console.log(err,b,c);
                       }
                      });


        });
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
