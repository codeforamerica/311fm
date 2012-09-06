define([
  // Application.
  "app",

  // // Modules
  "modules/filter"
],

function(app, Filter) {

  describe("test Search View", function() {

    // XXX: does not work as expected
    it("instantiating without model object throws exception", function() {

      // create new view with no model object - this throws
      // because view attempts to wire events to model object
      // but can't because it is undefined
      //var searchView = new Filter.Views.Search();
      
      // // but we never reach this because the error happened above.
      //expect(searchView).toThrow();

      // // this does not work either      
      expect( function() { new Filter.Views.Search(); } ).toThrow();

    });

    it("is uses filter/search for template value", function() {

      // create new view
      var searchView = new Filter.Views.Search(new Filter.Model());

      // assert
      expect(searchView.template).toBe("filter/search");

    });

    it("is uses div for tagName value", function() {

      // create new view
      var searchView = new Filter.Views.Search(new Filter.Model());

      // assert
      expect(searchView.tagName).toBe("div");

    });

    it("is uses searchBox for id value", function() {

      // create new view
      var searchView = new Filter.Views.Search(new Filter.Model());

      // assert
      expect(searchView.id).toBe("searchBox");

    });    

    it("it contains expected event definitions", function() {

      // create new view
      var searchView = new Filter.Views.Search(new Filter.Model());

      // assert
      expect(searchView.events["click .btn"]).toBe("findLocation");
      expect(searchView.events["keypress #search"]).toBe("enterSearch");

    });        

  });

});


