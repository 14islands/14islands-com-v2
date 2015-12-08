###*
#
# Map animation component.
#
# For SPG Case Study
#
# @author 14islands
#
###

class FOURTEEN.SpgMapAnimation extends FOURTEEN.ElementScrollVisibility 	
	
	EVENT_MAP_TOGGLE_LAYER = 'event-property-map-toggle-layer';

	###
	scripts: [
		'//api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.js',
		'//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/leaflet.markercluster.js'
	]

	links: [
		'//api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.css',
		'//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.css'
	]
	###

	constructor: (@$context, data) ->
		@el = @$context.get(0);
		@initMap_()
		@initMapMarkers_();
		@addEventListeners_();
		# @showAll();

		# init FOURTEEN.ElementScrollVisibility
		super(@$context, data)
	
	addEventListeners_: () =>
		#@map.on('popupopen', @onPopupOpen_);
		#@map.on('popupclose', @onPopupClose_);
		$(document).on(
			EVENT_MAP_TOGGLE_LAYER, 
			(e, id) => @toggleLayers_(id);
		);

	removeEventListeners_: () =>
		#@map.off('popupopen', @onPopupOpen_);
		#@map.off('popupclose', @onPopupClose_);
		$(document).off(EVENT_MAP_TOGGLE_LAYER);
	
	toggleLayers_: (id) =>
		@clusterGroup.clearLayers();
		if (isFinite(id) && id < @layers.length)
			@clusterGroup.addLayer(@layers[id]);
		else
			#if (@clusterGroup.hasLayer(@layers[0]))
			@clusterGroup.addLayer(@layers[0]);
			@clusterGroup.addLayer(@layers[1]);
			@clusterGroup.addLayer(@layers[2]);

		@fitAllInViewport();
	
	createLayer_: (geoData) =>
		L.geoJson(geoData, {
			pointToLayer: (geojson, latlng) =>
				className = 'single-bostad';
				className = 'single-omsorg' if (geojson.properties.btype == 'omsorg')
				className = 'single-utveckling' if (geojson.properties.btype == 'utveckling')
				return L.marker(latlng, {
					icon: FOURTEEN.SpgMarker.icon(className)
			 	});
			 onEachFeature: (feature, layer) =>
				#this.bindPopupToLayer(layer) 
				#console.log("adding feature", feature);  
		});

	
	@getIconSize: () =>
		if (window.innerWidth >= 768)
			return 130;
		return 70;
	
	initMap_: () =>
		# Provide your access token
		L.mapbox.accessToken = 'pk.eyJ1IjoiMTRpc2xhbmRzIiwiYSI6IjFmYWIwMDU4YjkwMDMyNTQyOWQ4ZDEyYzM0M2NjYTI4In0.6mbPptnajbHi2n0hn39jQA';

		# Create a map in the div #map
		@map = L.mapbox.map(@el, '14islands.9770525d', {
			#scrollWheelZoom: false,
			zoomControl: false,
			attributionControl: false,
			maxZoom: 18,
			minZoom: 4,
			zoomAnimationThreshold: 10,
			#dragging: false
		});
	
	initMapMarkers_: () =>
		# https:#github.com/Leaflet/Leaflet.markercluster
		@clusterGroup = new L.MarkerClusterGroup({
			iconCreateFunction: FOURTEEN.SpgClusterMarker.iconFromGeoData,
			showCoverageOnHover: false,
			spiderfyOnMaxZoom: true,
			maxClusterRadius: FOURTEEN.SpgMapAnimation.getIconSize(),
			zoomToBoundsOnClick: false,
			animateAddingMarkers: false,
			spiderfyDistanceMultiplier: 4 # distance away from the center that spiderfied markers are placed. Use if you are using big icons - default: 1
		});
		@clusterGroup.on('clusterclick', (e) =>
			bounds = e.layer.getBounds().pad(0.5);
			@map.fitBounds(bounds);  
		);
		@clusterGroup.addTo(@map);
		
		# create marker layers inside group so we can turn on/off
		@layers = [
			@createLayer_(SPG.markers),
			@createLayer_(SPG.markers2),
			@createLayer_(SPG.markers3)
		];
		
		# show layers
		@toggleLayers_();

	
	fitAllInViewport: () =>
		# let's add some padding on desktop
		padding = window.innerWidth * 0.05;
		@map.fitBounds(@clusterGroup.getBounds(), {
			padding: [padding, padding]
		});
	
	destroy: () =>
		@removeEventListeners_();
		super.destroy();
	
	@showAll: () =>
		$(document).trigger(EVENT_MAP_TOGGLE_LAYER);
	
	@showLayer: (id) =>
		$(document).trigger(EVENT_MAP_TOGGLE_LAYER, id);

class FOURTEEN.SpgMarker
	@icon: (className) =>
		size = FOURTEEN.SpgMapAnimation.getIconSize() * 0.6; #single marker size ratio
		return L.divIcon({
			className: 'component-property-map__marker ' + className,
			iconSize: [size, size],
			iconAnchor: [size/2, size/2],
			popupAnchor: [0, -7],
			html: '<span></span>' # add icon in here so we can animate transform without interfering with mapbox
		});


class FOURTEEN.SpgClusterMarker
	constructor: (cluster) ->
		@cluster = cluster;
		@defaultClassName = 'component-property-map__marker';
		@inspectData_();

	inspectData_: () =>
		@types = {};
		@cluster.getAllChildMarkers().forEach( (marker) =>
			@types[marker.feature.properties.btype] = true;
		);
		typeClass = Object.keys(@types).join('-');
		@typeClassName = 'cluster-' + typeClass;
	
	getIcon: () =>
		size = FOURTEEN.SpgMapAnimation.getIconSize();
		return L.divIcon({
			className: "#{@defaultClassName} #{@typeClassName}",
			iconSize: [size, size],
			iconAnchor: [size/2, size/2],
			popupAnchor: [0, 11],
			html: '<span></span>' # add icon in here so we can animate transform without interfering with mapbox
		});
	
	@iconFromGeoData: (cluster) =>
		return new FOURTEEN.SpgClusterMarker(cluster).getIcon();
