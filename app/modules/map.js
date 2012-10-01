define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Map = app.module();


  var PolygonArea = function(pts) {
    var area=0;
    var nPts = pts.length;
    var j=nPts-1;
    var p1; var p2;

    for (var i=0;i<nPts;j=i++) {
      p1=pts[i]; p2=pts[j];
      area+=p1.x*p2.y;
      area-=p1.y*p2.x;
    }
    area/=2;
    return area;
  };

  var PolygonCentroid = function(pts) {
    var nPts = pts.length;
    var x=0; var y=0;
    var f;
    var j=nPts-1;
    var p1; var p2;

    for (var i=0;i<nPts;j=i++) {
      p1=pts[i]; p2=pts[j];
      f=p1.x*p2.y-p2.x*p1.y;
      x+=(p1.x+p2.x)*f;
      y+=(p1.y+p2.y)*f;
    }

    f=PolygonArea(pts)*6;
    return [x/f,y/f];
  };


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
      if(this.cities.length > 0){
        this.changeCities();
      }
    },
    mapMoved:function(){
      var latlng = this.map.getCenter();

      var city = this.currentCity = this.cities.endpointByLocation(latlng);
      
      if(city){
        app.filters.addOrSet("jurisdiction_id", city.get("jurisdiction_id"));
        app.trigger("city_changed", city);
      }
    },
    zoomChanged:function(){
      console.log("zoom",this.map.getZoom());
      if(this.map.getZoom() > 13){
        //close enough for requests.
        console.log("requests")
        this.clearCityBounds();
        this.citiesGroup.clearLayers();
        this.renderRequests();
      }else if(this.map.getZoom() > 10){
        //cluster markers.
        console.log("neighborhood cluster-markers")
        this.mapBoundaries.clearLayers();
        this.citiesGroup.clearLayers();
        this.srGroup.clearLayers();
        if(this.currentCity)
          this.changeBoundaries(this.currentCity);
      }else if(this.map.getZoom() > 6){
        //cluster markers.
        console.log("city level cluster-markers")
        this.mapBoundaries.clearLayers();
        this.citiesGroup.clearLayers();
        this.srGroup.clearLayers();
      }else{
        console.log("city name")
        // just city names 
        this.clearCityBounds();
        this.citiesGroup.clearLayers();
        this.mapBoundaries.clearLayers();
        this.changeCities();
        this.srGroup.clearLayers();
      }
    },
    cleanup: function() {
      app.off(null, null, this);
    },
    changeBoundaries:function(city){
      if(this.map.getZoom() < 13)
        return;
      var boundaries = city.get("boundaries");
      this.mapBoundaries.clearLayers();
      this.mapBoundaries = new L.LayerGroup();
      var self =  this;
      _.each(boundaries.features, function(bound){
        var points = [];
        var count = 0;
        _.each(bound.geometry.coordinates, function(poly){
          points[count] = [];
          var cpoints = [];
          _.each(poly, function(coord){
            points[count].push(new L.LatLng(coord[1], coord[0]));
            cpoints.push({x:coord[0], y:coord[1]})
          });
          bound.centeroid = PolygonCentroid(cpoints);
          count++;
        });
      
        var polygon  = new L.MultiPolygon(points, {stroke:false, color:"#03f", weight:3, fill:true, fillOpacity:0});
        polygon.points = points;
        if(!isNaN(bound.centeroid[0])){

          if(city.get("stats")){
            var stat = city.get("stats").where({ward:bound.properties.WARD});
            if(stat && stat.length > 0){
              var boundaryIcon = L.divIcon({className: 'boundary-icon',
                                            iconAnchor:[25, 25],
                                            iconSize:[50,50],
                                            html:"<div class='cluster-marker'>"+
                                            "<img src='/assets/img/markers/cluster.png' />"+
                                            "<div class='marker-label'>"+stat[0].get("opened_requests")+"</div></div>"
                                           });

              var marker = new L.Marker([bound.centeroid[1], bound.centeroid[0]], 
                                        {icon:boundaryIcon});
              self.mapBoundaries.addLayer(marker);
              polygon.marker = marker;
              marker.polygon = polygon;
              
              var zoomToBoundary = function(polygon, map){
                
                
                var latlngs=  [].concat(polygon.points);

                var bounds = new L.LatLngBounds(latlngs);
                if(map.getZoom() <= 13)
                  map.fitBounds(bounds);
              }
              
              marker.on("mouseover", function(ev){
                this.polygon.setStyle({stroke:true});
              });
              marker.on("mouseout", function(ev){
                this.polygon.setStyle({stroke:false});
              });
              marker.on("click", function(){
                zoomToBoundary(this.polygon, self.map);
              });
            }
          }
        }
        polygon.on("mouseover", function(ev){
          this.setStyle({stroke:true});
          //get marker element, show label.
        });
        polygon.on("mouseout", function(ev){
          this.setStyle({stroke:false});
          //get marker element, hide label.
        });
        polygon.on("click", function(ev){
          zoomToBoundary(this, self.map);
        });

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
        var cityIcon = L.divIcon({className: 'city-icon',
                                  iconAnchor:[5, 60],
                                  iconSize:[150,50],
                                  html:"<div class='poll'></div>"+
                                  "<div class='flag'>"+city.get("name").split(",")[0]+"</div>"+
                                  "<div class='shadow'></div>"
                                 });

        if(city.get("supports_json")){
          latLngs.push([city.get('lat'), city.get('lng')]);
          markers.push(new L.Marker([city.get('lat'), city.get('lng')], {cityName:city.get("name"), icon:cityIcon} ));
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
      if(this.cityClusterMarker){
        this.map.removeLayer(this.cityClusterMarker);
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
        console.log("polygon",city.get("name"))
        var cpoints = []

        _.each(p.geometry.coordinates, function(poly){
          points[count] = [];
          _.each(poly, function(coord){
            points[count].push(new L.LatLng(coord[1], coord[0]));
            cpoints.push({x:coord[0], y:coord[1]})
          });
          count++;
        });


        var sum = 0;
        if(city.get("stats")){
          sum = city.get("stats").reduce(function(memo, stat){ return memo + stat.get("opened_requests"); }, sum);
        }else{
          sum = this.serviceRequests.where({"jurisdiction_id": 
                                            app.filters.where({"name":"jurisdiction_id"})[0].get("value")}).length;
        }
        

        var center =  PolygonCentroid(cpoints);        
        var boundaryIcon = L.divIcon({className: 'boundary-icon',
                                      iconAnchor:[30, 30],
                                      iconSize:[60,60],
                                      html:"<div class='cluster-marker'>"+
                                      "<img src='/assets/img/markers/cluster.png' />"+
                                      "<div class='marker-label'>"+sum+"</div></div>"
                                     });

        this.cityClusterMarker = new L.Marker([center[1], center[0]], 
                                              {icon:boundaryIcon});
        this.cityClusterMarker.addTo(this.map);
      }
      
      this.cityPolygon  = new L.MultiPolygon(points, {stroke:true, color:"#333", weight:4, fill:false});
      this.cityPolygon.bindPopup(city.get("name"));
      this.cityPolygon.addTo(this.map)
      
      this.cityClusterMarker.polygon = this.cityPolygon;
      this.cityPolygon.marker = this.polygon;



    },
    renderRequests:function(){
      if(this.map.getZoom() <= 10)
        return;
      
      console.log("render requests");
      var markers = [];
      var self = this;

      if( app.filters.where({"name":"jurisdiction_id"}).length > 0){
        var srs = this.serviceRequests.where({"jurisdiction_id": 
                                              app.filters.where({"name":"jurisdiction_id"})[0].get("value")});
      }else{
        var srs = this.serviceRequests.where();
      }

      _.each(srs, function(sr){
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
        (request.status === "closed" ? "<h5>CLOSED</h5>" : "") + "</div><div class='clear'></div>";

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
      this.mapBoundaries = new L.LayerGroup();
      this.srGroup = new L.FeatureGroup();
      this.boundaries = e.boundaries;
      this.boundaries.on("add", this.changeBoundaries, this);
      this.cities = e.cities;

      this.cities.on("add", this.changeCities, this);


/*      this.cityIcon = new L.icon({
        iconUrl: '/assets/img/markers/city-icon.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [-3, -12],
        shadowUrl: '/assets/img/markers/city-icon-shadow.png',
        shadowSize: [40, 40],
        shadowAnchor: [20, 40]
      });*/
    }  
  });

  // Return the module for AMD compliance.
  return Map;

});
