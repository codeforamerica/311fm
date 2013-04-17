define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Stats = app.module();

  // Default model.
  Stats.Model = Backbone.Model.extend({
    
  });

  // Default collection.
  Stats.Collection = Backbone.Collection.extend({
    model: Stats.Model,
    sync: function(method, collection, options){
      collection.reset()
      var url = "http://freaky-mustard-data.herokuapp.com/api/v1/ward/summary";

      var startdate = new Date(Date.now() - 2592000000); //last month
      var enddate = new Date();

      options.data.start = startdate.getFullYear()+"-"+(startdate.getMonth()+1)+"-"+startdate.getDate();
      options.data.end = enddate.getFullYear()+"-"+(enddate.getMonth()+1)+"-"+enddate.getDate();

      if(method == "read"){
        $.ajax(url, {data:options.data, 
          dataType:"json",
          success:function(data) {
            collection.add({city:"chicago", "stats":data.summaries}, {silent:true});
            collection.trigger("add");
          },
          error:function(err,b,c) {
            console.log(err,b,c);
          }
        });
      }
    }
  });

  // Return the module for AMD compliance.
  return Stats;

});
