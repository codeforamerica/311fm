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
      var self = this;
      this.map = new L.Map('map', {zoomControl:false})  
        .setView(new L.LatLng(37.774, -122.419), 12);
      wax.tilejson(url, function(tilejson) {
        self.map.addLayer(new wax.leaf.connector(tilejson));
      });
      //this.boundaries.fetch();
    },
    cleanup: function() {
      app.off(null, null, this);
    },
    addBoundaries:function(){
      this.mapBoundaries.clearLayers(); 
      this.mapBoundaries = new L.LayerGroup();
      var self =  this;
      this.boundaries.each(function(bound){
        var points = [];
        var count = 0;
        _.each(bound.get("geometry").coordinates, function(poly){
          points[count] = [];
          _.each(poly, function(coord){
            points[count].push(new L.LatLng(coord[1], coord[0]));
          });
          count++;
        });
      
        var polygon  = new L.MultiPolygon(points, {stroke:true, color:"#03f", weight:2, fill:true});
        polygon.bindPopup(bound.get("properties").nbrhood);
        self.mapBoundaries.addLayer(polygon);
      });
      this.mapBoundaries.addTo(this.map);
    },
    initialize: function(e) {
      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
      this.mapBoundaries = new L.LayerGroup();
      this.boundaries = e.boundaries;
      this.boundaries.on("add", this.addBoundaries, this);
    }  
  });

  // Return the module for AMD compliance.
  return Map;

});
