define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Boundary = app.module();

  // Default model.
  Boundary.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  Boundary.Collection = Backbone.Collection.extend({
    model: Boundary.Model,
    sync: function(method, collection, options){
      collection.reset()
      var url = "/assets/js/data/sf_neighborhoods.json"

      if(method == "read"){
        $.ajax(url, {data:options.data, 
          dataType:"json",
          success:function(data) {
            _.each(data.features, function(feat){
              collection.add(feat, {silent:true});
            });
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
  return Boundary;

});
