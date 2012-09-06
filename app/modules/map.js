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
        .setView(new L.LatLng(37.774, -98.419), 5);
      wax.tilejson(url, function(tilejson) {
        self.map.addLayer(new wax.leaf.connector(tilejson));
      });
      this.map.on("zoomend",this.zoomChanged, this);

      //this.boundaries.fetch();
    },
    zoomChanged:function(){
      console.log("zoom",this.map.getZoom());
      if(this.map.getZoom() > 12){
        this.citiesGroup.clearLayers();
        this.renderRequests();
      }else{
        this.changeCities();
        this.srGroup.clearLayers();
      }
    },
    cleanup: function() {
      app.off(null, null, this);
    },
    changeBoundaries:function(){
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
    changeCities:function(){
      
      if(this.citiesGroup){
        this.citiesGroup.clearLayers();
      }
      var markers = [];
      this.cities.each(function(city){
        markers.push(new L.Marker([city.get('lat'), city.get('lng')], {cityName:city.get("name")} ));
      });


      this.citiesGroup = new L.FeatureGroup(markers)
        .on("click", this.cityClick, this)
        .addTo(this.map);

    },
    cityClick:function(ev ){
      console.log("cityclick",ev.layer.options.cityName);
      var city = this.cities.where({name:ev.layer.options.cityName})[0];
      ev.target._map.setView(ev.layer.getLatLng(), 13);
      this.cityBounds(city);
      app.filters.addOrSet("jurisdiction_id", city.get("jurisdiction_id"));
    },
    cityBounds:function(city){
      var p = city.get("polygon");

      var points = [];
      var count = 0;
      if(!p){
        return;
      }
      if(p.geometry.type == "MultiPolygon"){
        _.each(p.geometry.coordinates, function(poly){
          points[count] = [];
          var count2 = 0;
          _.each(poly, function(poly2){
            points[count][count2] = [];
            _.each(poly2, function(coord){
              points[count][count2].push(new L.LatLng(coord[1], coord[0]));
            });
            count2++;
          });
          count++;
        });
      }else if(p.geometry.type == "Polygon"){
        _.each(p.geometry.coordinates, function(poly){
          points[count] = [];
          _.each(poly, function(coord){
            points[count].push(new L.LatLng(coord[1], coord[0]));
          });
          count++;
        });
      }
      
      var polygon  = new L.MultiPolygon(points, {stroke:true, color:"#333", weight:4, fill:false});
      polygon.bindPopup(city.get("name"));
      polygon.addTo(this.map)
      
    },
    renderRequests:function(){
      var markers = [];
      this.serviceRequests.each(function(sr){
        var marker = new L.Marker([sr.get('lat'), sr.get('long')], {service_request_id:sr.get("service_request_id")} );
        marker.bindPopup(sr.get("service_name"));
        markers.push(marker);
      });

      if(!this.srGroup){
        this.srGroup = new L.FeatureGroup();
      }
      for(m in markers){
        this.srGroup.addLayer(markers[m]);
      }
      this.srGroup.addTo(this.map);

    },
    clearRequests:function(){
      if(this.srGroup){
        this.srGroup.clearLayers();
      }      
    },
    initialize: function(e) {
      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
      this.serviceRequests = e.serviceRequests;
      this.serviceRequests.on("add", this.renderRequests, this);
      this.serviceRequests.on("reset", this.clearRequests, this);
      this.mapBoundaries = new L.LayerGroup();
      this.srGroup = new L.FeatureGroup();
      this.boundaries = e.boundaries;
      this.boundaries.on("add", this.changeBoundaries, this);
      this.cities = e.cities;
      this.cities.on("add", this.changeCities, this);
      this.cities.fetch();
    }  
  });

  // Return the module for AMD compliance.
  return Map;

});
