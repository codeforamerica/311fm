L.Control.Center = L.Control.extend({

  options: {
    position: 'topleft'
  },
  initialize: function (options) {
    if(options.click)
      this.click = options.click;
    L.Util.setOptions(this, options);
  },
  onAdd: function (map) {
	this._map = map;
	this._container = L.DomUtil.create('div', 'leaflet-control-center');

	this._centerButton = this._createButton(
	  'Center', 'leaflet-control-center', this.click, this._map);

	this._container.appendChild(this._centerButton);
    return this._container;
  },

  _createButton: function (title, className, fn, context) {
	var link = document.createElement('a');
	link.href = '#';
	link.title = title;
	link.className = className;

	if (!L.Browser.touch) {
	  L.DomEvent.disableClickPropagation(link);
	}
	L.DomEvent.addListener(link, 'click', L.DomEvent.preventDefault);
	L.DomEvent.addListener(link, 'click', fn, context);

	return link;
  }
});