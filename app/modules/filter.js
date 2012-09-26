define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Filter = app.module();

  // Default model.
  Filter.Model = Backbone.Model.extend({});

  // Default collection.
  Filter.Collection = Backbone.Collection.extend({
    model: Filter.Model,
    addOrSet:function(name, value){
      var filters = this.where({name:name});
      if(filters.length > 0)
        filters[0].set("value", value);
      else
        this.add({name:name, value:value});
    }
  });

  Filter.Views.Search = Backbone.View.extend({
    template: "filter/search",

    tagName: "div",

    id: "searchBox",

    events: {
        "click .btn": "findLocation",
        "keypress #search": "enterSearch"
    },

    enterSearch: function(ev){
        if(ev.keyCode == 13)
            this.findLocation();
    },

    findLocation: function(ev) {
      var model = this.model;
      var url= "https://api.foursquare.com/v2/venues/explore";
      var self =this;
      $.ajax(url, {dataType:"jsonp", 
                   data:{client_id: "05JK2J5ZZ1XKAH5AN1CL1ZQNOGJFVA0YD00FG154D2P5XDF4",
                         client_secret: "J3XOISHZ5VKS3C5U1RPYW2C4JID5FRWX1KSSJNPZKPBJIGIF",
                         limit:1,
                         near: this.$el.find("#search").val()}, success:function(data){

                           //if they enter a neighborhood we know then it should add that as a filter.
                           // otherwise just move the map
                           app.trigger("location_change", data.response.geocode);
                   }});
    },

    cleanup: function() {
      this.model.off(null, null, this);
    },

    initialize: function() {
      this.collection.on("change", this.render, this);
      this.collection.on("reset", this.render, this);
    }
  });

  Filter.Views.Controls = Backbone.View.extend({
    template: "filter/controls",
    
    tagName: "div",

    id: "filters",
    
    events: {
      "change .services": "serviceChange",
      "change .status": "statusChange",
      "change .date": "dateChange",
      "click .addNewLocation": "newLocation",
      "click .removeLocation": "removeLocation",
      "click ul.nav li": "navigationChange",
      "click div.nubbin": "colapse",
    },
    afterRender: function(){
      $(this.el).find("ul.nav li."+this.selected).addClass("selected");
      $("#sidebar div.nubbin").click(function(){app.trigger("show_nav");});
    },
    colapse:function(ev){
      app.trigger("show_nav");
    },
    navigationChange: function(ev){ 
      //check which one
      var view = $(ev.target).closest("li").removeClass("selected").attr("class");
      app.router.navigate(view, {trigger:false});
      app.trigger("view_change",{view:view});
    },
    serviceChange: function(ev){ /* TBD */ },

    statusChange: function(ev){
      var open=false, closed = false;
      open =$(this.el).find(".status[name=open]").is(":checked");
      closed =$(this.el).find(".status[name=closed]").is(":checked");
      
      if(!(closed && open)){
        //if they arent both true
        var value = closed ? "closed": "open";

        var status = this.collection.where({name:"status"})[0];
        if(!status)
          this.collection.add({name:"status", value:value});
        else
          status.set("value", value);
      }else{
        status = this.collection.where({name:"status"});
        this.collection.remove(status);
      }
    },

    dateChange:function(ev){ /* TBD */ },

    newLocation: function(ev){ /* TBD */ },

    removeLocation: function(ev){ /* TBD */ },

    cleanup: function() {
      this.collection.off(null, null, this);
    },
    hide:function(ev){
      $("#sidebar").removeClass("active");
    },
    show:function(ev){
      setTimeout(function(){$("#sidebar").addClass("active");}, 200);
    },
    handleViewChange:function(ev){
      $(this.el).find("ul.nav li").removeClass("selected");
      this.selected = ev.view;
      $(this.el).find("ul.nav li."+this.selected).addClass("selected");
    },
    initialize: function() {
      //this.collection.on("change", this.render, this);
      //this.collection.on("reset", this.render, this);
      app.on("show_nav", this.hide, this);
      app.on("show_filters", this.show, this);
      app.on("view_change", this.handleViewChange, this)
    }  
  });

  // Return the module for AMD compliance.
  return Filter;
});
