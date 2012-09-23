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

  // Contour object
  function Contour(a) {
    this.pts = a || []; // an array of Point objects defining the contour
    return this;
  }


  Contour.prototype.area = function() {
    var area=0;
    var pts = this.pts;
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

  Contour.prototype.centroid = function() {
    var pts = this. pts;
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

    f=this.area()*6;
    return {x: x/f,y:y/f};
  };

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
    },
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
    isPointInPoly: function(poly, pt){
      for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
      return c;
    },
    endpointByLocation:function(latlng){ 
      var self = this;
      var within_city = null;
      this.each(function(city){
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
                points[count][count2].push({y:coord[0], x:coord[1]});
              });
              if(self.isPointInPoly(points[count][count2], {x:latlng.lat, y:latlng.lng})){
                within_city = city;
              }
              count2++;
            });
            count++;
          });
        }else if(p.geometry.type == "Polygon"){
          _.each(p.geometry.coordinates, function(poly){
            points[count] = [];
            _.each(poly, function(coord){
              points[count].push({y:coord[0], x:coord[1]});
            });
            if(self.isPointInPoly(points[count], {x:latlng.lat, y:latlng.lng})){
              within_city =  city;
            }
            count++;
          });
        }

      });
      return within_city;
    }

  });

  // Return the module for AMD compliance.
  return City;

});
