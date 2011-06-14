/*
 * ExtJS/GeoExt script voor het laden van de kaart applicatie en functies van de applicatie.
 * 
 * @author mprins
 */
/**
 * toevoegen van untiled WMS aan de kaart.
 * 
 * @author mprins
 * @param conf
 *            mapservice config object
 */
function addWMS(conf) {
	var opts = {
		isBaseLayer : false,
		visibility : false,
		opacity : 0.8,
		singleTile : true,
		transitionEffect : 'resize'
	}, lyr;

	if (conf.layers.length > 1) {
		// meer dan 1 layer voor deze WMS
		for ( var ly = 0; ly < conf.layers.length; ly++) {
			lyr = new OpenLayers.Layer.WMS(conf.naam + ':' + conf.layers[ly],
					conf.url, {
						layers : conf.layers[ly],
						transparent : true,
						format : 'image/png'
					}, opts);
			mapPanel.map.addLayer(lyr);
		}
	} else {
		// 1 layer voor deze WMS
		lyr = new OpenLayers.Layer.WMS(conf.naam, conf.url, {
			layers : conf.layers,
			transparent : true,
			format : 'image/png'
		}, opts);
		mapPanel.map.addLayer(lyr);
	}
}
/**
 * toevoegen van WFS aan de kaart met een random kleur.
 * 
 * @author mprins
 * @param conf
 *            mapservice config object
 */
function addWFS(conf) {
	var fType, fTypePrefx, slash = '', colour, wfs;

	if (conf.layers[0].indexOf(':') > -1) {
		fTypePrefx = conf.layers[0].split(':')[0];
		fType = conf.layers[0].split(':')[1];
	} else {
		fType = fTypePrefx = conf.layers[0];
	}

	// TODO er zit een bug in pdok namespaces, natura2000 eindigd op .nl/ de
	// rest op .nl

	if (NAMESPACE_SLASH_EXCEPTIONS.indexOf(fTypePrefx) > -1) {
		slash = '/';
	}
	// random kleurtje aanmaken
	colour = '#'
			+ ('000000' + Math.round(0xffffff * Math.random()).toString(16))
					.substr(-6);
	wfs = new OpenLayers.Layer.Vector(conf.naam, {
		strategies : [ new OpenLayers.Strategy.BBOX() ],
		minResolution : 0.42,
		maxResolution : 26.880,
		projection : new OpenLayers.Projection('EPSG:28992'),
		protocol : new OpenLayers.Protocol.WFS({
			url : conf.url,
			srsName : 'EPSG:28992',
			version : '1.1.0',
			geometryName : 'geom',
			featureNS : 'http://' + fTypePrefx + '.geonovum.nl' + slash,
			featureType : fType,
			featurePrefix : fTypePrefx,
			// schema is eigenlijk alleen nodig om features te valideren, voor
			// alleen-lezen niet nodig
			// schema : conf.url
			// +
			// '?service=WFS&amp;version=1.1.0&amp;request=DescribeFeatureType&amp;typeName='
			// + fTypePrefx + '%3A' + fType,
			ratio : 1.5
		}),
		// http://docs.openlayers.org/library/feature_styling.html
		styleMap : new OpenLayers.StyleMap({
			'default' : new OpenLayers.Style({
				fillColor : colour,
				fillOpacity : 0.4,
				strokeColor : colour,
				strokeOpacity : 0.7,
				strokeWidth : 2,
				pointRadius : 4,
				graphicName : 'square'
			}),
			'select' : new OpenLayers.Style({
				fillColor : '#0000ee',
				fillOpacity : 0.4,
				strokeColor : '#0000ee',
				strokeOpacity : 1,
				strokeWidth : 2,
				pointRadius : 6,
				graphicName : 'square'
			})
		}),
		visibility : false
	});

	wfs.events
			.on({
				featureselected : function(event) {
					var feature = event.feature;
					// tabel met de feature info maken
					var html = '<table class="featureInfo"><caption>FID: '
							+ feature.fid
							+ '</caption><thead><tr><th>attribuut</th><th>waarde</th></tr></thead><tbody>';
					var i = 0;
					for ( var prop in feature.attributes) {
						html += '<tr class="' + ((i++ % 2) ? 'even' : 'odd')
								+ '"><td>' + prop + '</td><td>'
								+ feature.attributes[prop] + '</td></tr>';
					}
					html += '</tbody></table>';
					var popup;
					popup = new GeoExt.Popup({
						title : "Feature info voor layer: " + activeLyr.name,
						width : 250,
						height : 250,
						autoScroll : true,
						maximizable : true,
						modal : true,
						map : mapPanel.map,
						// feature selected heeft geen event.xy
						location : new OpenLayers.Pixel(300, 300),
						html : html
					});
					popup.on({
						close : function() {
							selectControl.unselect(feature);
						}
					});
					popup.show();
				}
			});
	mapPanel.map.addLayer(wfs);
}

/**
 * Toevoegen van de WMTS laag aan de kaart. De service is volgens de Nederlandse
 * tiling richtlijn (13 LOD met vastgestelde resoluties in RD).
 * 
 * @author mprins
 * @param conf
 *            mapservice config object
 */
function addWMTS(conf) {
	var matrixIds = new Array(13), lyr;
	for ( var i = 0; i < 13; ++i) {
		matrixIds[i] = "EPSG:28992:" + i;
	}

	lyr = new OpenLayers.Layer.WMTS({
		name : conf.naam,
		url : conf.url,
		layer : conf.layers,
		matrixSet : 'EPSG:28992',
		matrixIds : matrixIds,
		format : 'image/png8',
		style : '_null',
		opacity : 0.65,
		isBaseLayer : false,
		visibility : false
	});
	mapPanel.map.addLayer(lyr);
}

/**
 * Toevoegen van een formulier aan de tabstrip om adres te kunnen zoeken.
 * 
 * @author mprins
 * @param conf
 *            mapservice config object
 */
function addOLS(conf) {
	OpenLayers.Console.info('Niet geimplementeerd: toevoegen OLS: ' + conf.type
			+ 'layer: ', conf.naam);
}

/** map panel. */
var mapPanel,
/** capabilities panel. */
capsPanel,
/** tabbed panel. */
tabs,
/** active/selected layer. */
activeLyr = {
	name : '',
	url : '',
	layer : ''
},
/** vector select control/ */
selectControl;

/**
 * capabilities (of wat daar voor door gaat) document voor de layer ophalen.
 * 
 * @param layer
 *            een OpenLayers.Layer type uit de kaart
 */
function getCapabilities(layer) {
	var url = OpenLayers.ProxyHost + '';
	if (typeof layer == 'undefined') {
		return;
	} else if (layer.CLASS_NAME === 'OpenLayers.Layer.TMS') {
		// TMS is een "bijzonder" geval
		url += layer.getFullRequestString() + layer.serviceVersion;
	} else if (layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
		// WFS/Vector is ook een bijzonder geval, layer.protocol.url is geen API
		// property dus opletten bij migratie OpenLayers versie
		url += layer.protocol.url + '?REQUEST=GetCapabilities&VERSION='
				+ layer.protocol.version;
	} else {
		// zou moeten werken voor alle andere OWS
		url += layer.getFullRequestString({
			"REQUEST" : "GetCapabilities"
		});
	}

	tabs.activate(capsPanel);
	var updtr = capsPanel.getUpdater();
	updtr.setRenderer({
		/* override render; bepaalde char's worden vervangen door html entities */
		render : function(el, response, updateManager, callback) {
			var filt = response.responseText;
			filt = filt.replace(new RegExp('<', 'g'), '&lt;');
			filt = filt.replace(new RegExp('>', 'g'), '&gt;');
			filt = filt.replace(new RegExp('\n', 'g'), '<br/>');
			filt = filt.replace(new RegExp('  ', 'g'), '&nbsp;&nbsp;&nbsp;');
			el.update(filt, updateManager.loadScripts, callback);
		}
	});
	updtr.update({
		url : url,
		text : "Ophalen capabilities document voor " + layer.name,
		timeout : 30
	});
}

// na laden van de pagina starten met opbouw van applicatie
Ext
		.onReady(function() {
			// mappanel
			mapPanel = new GeoExt.MapPanel(
					{
						map : new OpenLayers.Map(
								{
									allOverlays : false,
									resolutions : [ 3440.64, 1720.32, 860.16,
											430.08, 215.04, 107.52, 53.76,
											26.88, 13.44, 6.72, 3.36, 1.68,
											0.84, 0.42 ],
									projection : new OpenLayers.Projection(
											'EPSG:28992'),
									displayProjection : new OpenLayers.Projection(
											"EPSG:28992"),
									maxExtent : new OpenLayers.Bounds(
											-285401.92, 22598.08,
											595401.9199999999,
											903401.9199999999),
									units : 'm',
									controls : [
											new OpenLayers.Control.ScaleLine(),
											new OpenLayers.Control.KeyboardDefaults(),
											new OpenLayers.Control.LoadingPanel(),
											new OpenLayers.Control.Navigation() ],
									fractionalZoom : false,
									zoom : 2
								}),
						region : "center",
						border : true,
						title : "Kaart",
						layers : [
								new OpenLayers.Layer.TMS(
										'BRT Achtergrondkaart (TMS)',
										BRT_ACHTERGRONDKAART_TMS_URL, {
											layername : 'brtachtergrondkaart',
											type : 'png8'
										}),
								new OpenLayers.Layer.TMS('Top10NL (TMS)',
										TOP10NL_TMS_URL, {
											layername : 'top10nl',
											type : 'png8'
										}) ],
						items : [ {
							xtype : "gx_zoomslider",
							vertical : true,
							height : 200,
							x : 10,
							y : 20,
							plugins : new GeoExt.ZoomSliderTip(
									{
										template : "Schaal: 1 : {scale}<br />Resolutie: {resolution}<br />nivo: {zoom}"
									})
						} ]
					});

			// services datastore
			var servicesStore = new Ext.data.JsonStore({
				url : 'serviceinfo.js.jsp',
				autoLoad : true,
				restful : false,
				storeId : 'myStore',
				root : 'services',
				idProperty : 'naam',
				fields : [ 'naam', 'url', 'type', {
					name : 'layers',
					type : 'Array'
				} ],
				listeners : {
					load : function(servicesStore, records, options) {
						servicesStore.each(function(s) {
							// service in de kaart zetten
							switch (s.data.type) {
							case 'wms':
								addWMS(s.data);
								break;
							case 'wmts':
								addWMTS(s.data);
								break;
							case 'wfs':
								addWFS(s.data);
								break;
							case 'ols':
								addOLS(s.data);
								break;
							default:
								OpenLayers.Console.error('Onbekend type: ',
										s.data.type);
							}
						});
					},
					exception : function(proxy, type, action, exception) {
						OpenLayers.Console.error('Fout: ', exception);
					}
				},
				sortInfo : {
					field : 'naam',
					direction : 'DESC'
				}
			});
			// WFS feat info
			selectControl = new OpenLayers.Control.SelectFeature([], {
				clickout : true
			});
			mapPanel.map.addControl(selectControl);

			// WMS feature info control
			var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo({
				// url : activeLyr.url,
				drillDown : false,
				queryVisible : true,
				maxFeatures : 20,
				infoFormat : 'text/html'
			});

			featureInfo.events
					.on({
						getfeatureinfo : function(event) {
							new GeoExt.Popup(
									{
										title : "WMS Feature info voor layer: "
												+ activeLyr.name
												+ ", ("
												+ mapPanel.map
														.getLonLatFromPixel(event.xy)
												+ ")",
										width : 500,
										height : 150,
										autoScroll : true,
										maximizable : true,
										modal : true,
										map : mapPanel.map,
										location : event.xy,
										// geoserver geeft altijd een html doc
										// terug dus dit komt eigenlijk niet
										// voor
										html : (event.text === "" ? "Er zijn geen objecten in de kaart gevonden"
												: event.text)
									}).show();
						},
						nogetfeatureinfo : function(event) {
							OpenLayers.Console
									.error('Er is geen databron voor feature informatie.');
						}
					});
			mapPanel.map.addControl(featureInfo);

			// WMTS feature info control
			var wmtsfeatureInfo = new OpenLayers.Control.WMTSGetFeatureInfo({
				drillDown : false,
				queryVisible : true,
				maxFeatures : 20,
				infoFormat : 'text/html'
			});

			wmtsfeatureInfo.events
					.on({
						getfeatureinfo : function(event) {
							new GeoExt.Popup(
									{
										title : "WMTS Feature info voor layer: "
												+ activeLyr.name
												+ ", ("
												+ mapPanel.map
														.getLonLatFromPixel(event.xy)
												+ ")",
										width : 500,
										height : 150,
										autoScroll : true,
										maximizable : true,
										modal : true,
										map : mapPanel.map,
										location : event.xy,
										// geoserver geeft altijd een html doc
										// terug dus dit komt eigenlijk niet
										// voor
										html : (event.text === "" ? "Er zijn geen objecten in de kaart gevonden"
												: event.text)
									}).show();
						},
						exception : function(event) {
							OpenLayers.Console
									.error(
											'Er is geen databron voor feature informatie of er is een andere fout opgetreden.',
											error);
						}
					});
			mapPanel.map.addControl(wmtsfeatureInfo);

			// layer tree
			var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI,
					new GeoExt.tree.TreeNodeUIEventMixin());

			// using OpenLayers.Format.JSON to create a nice formatted string of
			// the configuration for editing it in the UI
			var treeConfig = new OpenLayers.Format.JSON().write([ {
				nodeType : "gx_baselayercontainer"
			}, {
				nodeType : "gx_overlaylayercontainer",
				expanded : true,
				loader : {
					baseAttrs : {
						radioGroup : "foo",
						uiProvider : "layernodeui"
					}
				}
			// }, {
			// nodeType : "gx_layer",
			// layer : "Bestuurlijke Grenzen",
			// isLeaf : false,
			// create subnodes for the layers in the LAYERS param. If we
			// assign
			// a loader to a LayerNode and do not provide a loader
			// class, a
			// LayerParamLoader will be assumed.
			// loader : {
			// param : "LAYERS"
			// }
			} ], true);

			// create the tree with the configuration from above
			tree = new Ext.tree.TreePanel(
					{
						border : true,
						region : "west",
						title : "Services",
						width : 200,
						split : true,
						collapsible : true,
						collapseMode : "mini",
						autoScroll : true,
						plugins : [ new GeoExt.plugins.TreeNodeRadioButton(
								{
									listeners : {
										"radiochange" : function(node) {
											// deactivate info controls
											featureInfo.deactivate();
											wmtsfeatureInfo.deactivate();
											selectControl.deactivate();
											activeLyr.name = node.text;
											activeLyr.url = node.layer.url;
											activeLyr.layer = node.layer;
											// test voor type en juiste
											// control activeren
											if (node.layer.CLASS_NAME === 'OpenLayers.Layer.WMTS') {
												wmtsfeatureInfo.activate();
											} else if (node.layer.CLASS_NAME === 'OpenLayers.Layer.Vector') {
												selectControl
														.setLayer([ activeLyr.layer ]);
												selectControl.activate();
											} else if (node.layer.CLASS_NAME === 'OpenLayers.Layer.WMS') {
												// featureInfo.url =
												// activeLyr.url;
												featureInfo.layer = activeLyr.layer;
												featureInfo.activate();
											}
										}
									}
								}) ],
						loader : new Ext.tree.TreeLoader({
							// applyLoader has to be set to false to not
							// intefer with loaders
							// of nodes further down the tree hierarchy
							applyLoader : false,
							uiProviders : {
								"layernodeui" : LayerNodeUI
							}
						}),
						root : {
							nodeType : "async",
							// the children property of an
							// Ext.tree.AsyncTreeNode is used to
							// provide an initial set of layer nodes. We use the
							// treeConfig
							// from above, that we created with
							// OpenLayers.Format.JSON.write.
							children : Ext.decode(treeConfig)
						},
						listeners : {
							"radiochange" : function(node) {
								activeLyr.name = node.layer.name;
								activeLyr.url = node.layer.url;
								activeLyr.layer = node.layer;
							},
							"click" : function(node, event) {
								getCapabilities(node.layer);
							}
						},
						rootVisible : false,
						lines : false
					});

			var legendPanel = new GeoExt.LegendPanel({
				defaults : {
					style : 'padding:5px'
				},
				bodyStyle : 'padding:5px',
				autoScroll : true,
				title : "Legenda"
			});
			capsPanel = new Ext.Panel({
				title : 'Capabilities',
				bodyStyle : 'padding:5px',
				cls : 'capsPanel',
				autoScroll : true,
				html : 'Capabilities van geselecteerde service.'
			});

			var versiePanel = new Ext.Panel({
				title : 'Versie',
				bodyStyle : 'padding:5px',
				cls : 'versiePanel',
				autoScroll : true,
				autoLoad : 'versie.jsp',
				closable : true
			});

			tabs = new Ext.TabPanel({
				activeTab : 0,
				region : 'south',
				collapsible : true,
				collapseMode : "mini",
				split : true,
				height : 200,
				bodyStyle : 'padding:5px',
				items : [ legendPanel, capsPanel, versiePanel ]
			});

			new Ext.Viewport({
				layout : "fit",
				hideBorders : true,
				items : {
					layout : "border",
					deferredRender : false,
					items : [ mapPanel, tree, tabs, {
						contentEl : "desc",
						region : "east",
						bodyStyle : {
							"padding" : "5px"
						},
						collapsible : true,
						collapseMode : "mini",
						split : true,
						width : 200,
						title : "Uitleg"
					} ]
				}
			});

		});