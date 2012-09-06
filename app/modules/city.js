define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var City = app.module();

  // Default model.
  City.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  City.Collection = Backbone.Collection.extend({
    model: City.Model,
    sync: function(method, collection, options){
      collection.reset()
      var url = "/assets/js/data/cities.json"

      if(method == "read"){
        $.ajax(url, {data:options.data, 
          dataType:"json",
          success:function(data) {
            collection.add(data, {silent:true});
            collection.trigger("add");
          },
          error:function(err,b,c) {
            console.log(err,b,c);
          }
        }, "json");
      }
    }
  });

  // Return the module for AMD compliance.
  return City;

});
