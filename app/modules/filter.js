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
    model: Filter.Model
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
            findLocation();
    },

    findLocation: function(ev) {
      var model = this.model;
      console.log($el.find("#search").val());

      //do search, and trigger add location event
      //app.router.go("org", org, "user", name);
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
