define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Map = app.module();

  Map.Views.Map = Backbone.View.extend({

    tagName:"div",
    id:"map",
    events: {},
    firstLoad:true,
    afterRender: function(ev){ 
      var url = 'http://a.tiles.mapbox.com/v3/dmt.map-cdkzgmkx.jsonp';
      var self = this;
      this.map = new L.Map('map', {zoomControl:false})  
        .setView(new L.LatLng(37.774, -98.419), 5);
      wax.tilejson(url, function(tilejson) {
        self.map.addLayer(new wax.leaf.connector(tilejson));
      });
      this.map.on("zoomend",this.zoomChanged, this);
      this.map.on("moveend",this.mapMoved, this);
      

      this.map.addControl(new L.Control.Center({click:function(){
        self.firstLoad = true;
        self.changeCities();
      }}));
      this.map.addControl(new L.Control.Zoom());      
      //this.boundaries.fetch();
    },
    mapMoved:function(){
      var latlng = this.map.getCenter();

      var city = this.cities.endpointByLocation(latlng);
      if(city){
        this.cityBounds(city);
        app.filters.addOrSet("jurisdiction_id", city.get("jurisdiction_id"));
      }else{
        this.clearCityBounds();
        var f = app.filters.where({name:"jurisdiction_id"})
        if(f.length > 0){
          app.filters.remove(f);
        }
      }
      app.trigger("city_changed", city);
    },
    zoomChanged:function(){
      console.log("zoom",this.map.getZoom());
      if(this.map.getZoom() > 10){
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
      var self = this;
      var markers = [];
      var latLngs = [];
      this.cities.each(function(city){
        if(city.get("supports_json")){
          latLngs.push([city.get('lat'), city.get('lng')]);
          markers.push(new L.Marker([city.get('lat'), city.get('lng')], {cityName:city.get("name"), icon:self.cityIcon} ));
        }
      });

      this.citiesGroup = new L.FeatureGroup(markers)
        .on("click", this.cityClick, this)
        .addTo(this.map);

      if(this.firstLoad){
        var bounds = new L.LatLngBounds(latLngs);
        this.map.fitBounds(bounds);
        this.firstLoad = false;
      }

    },
    cityClick:function(ev ){
      console.log("cityclick",ev.layer.options.cityName);
      var city = this.cities.where({name:ev.layer.options.cityName})[0];
      ev.target._map.setView(ev.layer.getLatLng(), 11);
      this.cityBounds(city);
      app.filters.addOrSet("jurisdiction_id", city.get("jurisdiction_id"));
    },
    clearCityBounds: function(){
      if(this.cityPolygon){
        this.map.removeLayer(this.cityPolygon)
      }
    },
    cityBounds:function(city){   
      this.clearCityBounds();
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
      
      this.cityPolygon  = new L.MultiPolygon(points, {stroke:true, color:"#333", weight:4, fill:false});
      this.cityPolygon.bindPopup(city.get("name"));
      this.cityPolygon.addTo(this.map)
      
    },
    renderRequests:function(){
      var markers = [];
      var self = this;
      this.serviceRequests.each(function(sr){
        if(sr.get('lat')){
          var  marker = new L.Marker([sr.get('lat'), sr.get('long')], {service_request_id:sr.get("service_request_id")} );
          marker.bindPopup(self.popupForRequest(sr.toJSON()));
          markers.push(marker);
        }
      });

      if(!this.srGroup){
        this.srGroup = new L.FeatureGroup();
      }
      for(m in markers){
        this.srGroup.addLayer(markers[m]);
      }
      this.srGroup.addTo(this.map);

    },
    popupForRequest: function (request) {
      // TODO: need some sort of templating support here
      // var boundaryText = request.boundary ? ("<br/>" + request.boundary) : "";

      var parsedDate = new Date(request.requested_datetime);

      var content = "<h2>" + request.service_name + "</h2>";

      if (request.media_url && request.media_url !== "") {
        content = content.concat('<div class="photo">' + '<a href="'+request.media_url+'" target="_blank">' +
                                 '<img src="'+request.media_url+'" alt="request img" height="250" width="250" />' +
                                 '</a></div>'
                                );
      }

      content += "<div class='content'><h4>Address</h4><p>" + request.address + "</p>" +
        "<h4>Description</h4><p>" + request.description + "</p>" +
      //  "<h4>Created</h4><p>" + dateTools.formatDate(parsedDate) +
      //  " - <span class='ago'>"+dateTools.timeSpanString(parsedDate) + " ago</span></p>" + 
        (request.status === "closed" ? "<h5>CLOSED</h5>" : "") + "</div><div class='reset'></div>";

      return content;

    },
    setLocation:function(geocode){
      this.map.fitBounds([
        [geocode.geometry.bounds.sw.lat, geocode.geometry.bounds.sw.lng],
        [geocode.geometry.bounds.ne.lat, geocode.geometry.bounds.ne.lng]
      ]);
    },
    clearRequests:function(){
      if(this.srGroup){
        this.srGroup.clearLayers();
      }      
    },
    initialize: function(e) {
      app.on("show_filters", function(){$("#content").addClass("sidebar");}, this);
      app.on("show_nav", function(){$("#content").removeClass("sidebar");}, this);
      app.on("location_change", this.setLocation, this);
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
      this.cityIcon = new L.icon({
        iconUrl: '/assets/img/markers/city-icon.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [-3, -12],
        shadowUrl: '/assets/img/markers/city-icon-shadow.png',
        shadowSize: [40, 40],
        shadowAnchor: [20, 40]
      });

    }  
  });

  // Return the module for AMD compliance.
  return Map;

});
