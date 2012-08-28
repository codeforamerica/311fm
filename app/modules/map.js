define([
  // Application.
  "app",

],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Map = app.module();

  Map.Views.Map = Backbone.View.extend({

    tagName:"div",
    id:"map",
    events: {},

    afterRender: function(ev){ 
      var url = 'http://a.tiles.mapbox.com/v3/dmt.map-cdkzgmkx.jsonp';
      map = new L.Map('map', {zoomControl:false})  
        .setView(new L.LatLng(37.774, -122.419), 12);
      wax.tilejson(url, function(tilejson) {
        map.addLayer(new wax.leaf.connector(tilejson));
      });
    },
    cleanup: function() {
      app.off(null, null, this);
    },
    addBoundaries:function(){
      this.mapBoundaries.clearLayers(); 
      
      this.boundaries.each(function(bound){
        var polygon  = L.Polygon(bound.geometery.coordinates)
        this.mapBoundaries.addLayer(polygon);
      });

      this.mapBoundaries.addTo(this.map);
    },
    initialize: function(e) {
      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
      this.boundaries = e.boundaries;
      this.boundaries.on("add", this.addBoundaries, this);
    }  
  });

  // Return the module for AMD compliance.
  return Map;

});
