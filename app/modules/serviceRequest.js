define([
  // Application.
  "app",
  "modules/stats"
],

// Map dependencies from above array.
function(app, Stats) {

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
      filterParams.page_size = 300;
      
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

                         //console.log(data)
                         for(d in data){

                           data[d].city = city.get("name");
                           data[d].jurisdiction_id = city.get("jurisdiction_id");
                         }



                         // If this city has a stats api, use that.  If not calc some stats here.
                         if(city.get("stats_url")){

                           $.ajax(city.get("stats_url"), 
                                  {data:{start:"2012-09-01", end:"2012-10-01"},
                                   dataType:"jsonp", 
                                   success:function(data){
                                     var stats = new Stats.Collection();
                                     stats.add(data.summaries);
                                     city.set("stats", stats);
                                   }});
                         }

                         // Else If the city has boundaries, calc those stats based on open311 data.


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
