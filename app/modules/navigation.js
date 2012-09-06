define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Navigation = app.module();

  // Default model.
  Navigation.Model = Backbone.Model.extend({
  
  });

  // Default collection.
  Navigation.Collection = Backbone.Collection.extend({
    model: Navigation.Model
  });

  Navigation.Views.SubNav = Backbone.View.extend({
    template: "navigation/nav",
    
    tagName: "div",

    id: "barnav",
    
    events: {
      "click li": "navigationChange",
    },
    afterRender:function(){
      //TODO fix super hack - Mick
      $(this.el).find("li."+this.selected).addClass("selected");
    },
    navigationChange: function(ev){ 
      //check which one
      var view = $(ev.target).closest("li").attr("class").replace(" selected", "");

      if(view == "filters")
        app.trigger("show_filters");
      else{
        app.router.navigate(view, {trigger:false});
        app.trigger("view_change", {view:view});
      }
    },
    show:function(){
      setTimeout(function(){$("#subnav").addClass("active");}, 200);
    },
    hide: function(){
      $("#subnav").removeClass("active");
    },
    cleanup: function() {

    },
    handleViewChanged:function(ev){
      $(this.el).find("ul.nav li").removeClass("selected");
      this.selected = ev.view;
      $(this.el).find("ul.nav li."+this.selected).addClass("selected");
    },
    initialize: function(opt) { 
      this.selected = opt.selected;
      app.on("show_nav", this.show, this);
      app.on("show_filters", this.hide, this);
      app.on("view_change", this.handleViewChanged, this);
    }  
  });

  // Return the module for AMD compliance.
  return Navigation;

});
