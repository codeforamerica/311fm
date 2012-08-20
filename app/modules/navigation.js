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
      $("#sidebar div.nubbin").click(this.show);
    },
    navigationChange: function(ev){ 
      //check which one
      this.hide();
    },
    show:function(){
      $("#sidebar").removeClass("active");
      //$("#subnav").addClass("active");
      setTimeout(function(){$("#subnav").addClass("active");}, 200);
//      $("#sidebar").animate({"left": -325}, {complete:function(){
//                                               $("#subnav").animate({"left": 0});
//                                            }});
    },
    hide: function(){
      $("#subnav").removeClass("active");
      setTimeout(function(){$("#sidebar").addClass("active");}, 200);
      
//      $("#subnav").animate({"left": -105}, {complete:function(){
//                                              $("#sidebar").animate({"left": 0});
//                                            }});
    },
    cleanup: function() {
      this.model.off(null, null, this);
    },
    initialize: function() { }  
  });

  // Return the module for AMD compliance.
  return Navigation;

});
