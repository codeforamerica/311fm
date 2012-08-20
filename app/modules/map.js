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
      //setup leaflet
      var url = 'http://a.tiles.mapbox.com/v3/dmt.map-cdkzgmkx.jsonp';

      // Make a new Leaflet map in your container div
      map = new L.Map('map', {zoomControl:false})  

      // Center the map on Washington, DC, at zoom 15
        .setView(new L.LatLng(37.774, -122.419), 12);

      // Get metadata about the map from MapBox
      wax.tilejson(url, function(tilejson) {
        // Add MapBox Streets as a base layer
        map.addLayer(new wax.leaf.connector(tilejson));
      });
    },

    cleanup: function() {

    },

    initialize: function() {


    }  
  });

  // Return the module for AMD compliance.
  return Map;

});
