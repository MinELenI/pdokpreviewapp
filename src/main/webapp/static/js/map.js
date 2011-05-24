OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;
OpenLayers.Util.onImageLoadErrorColor = 'transparent';
OpenLayers.ProxyHost = 'proxy.jsp?';
/**
 * toevoegen van untiled WMS aan de kaart.
 * 
 * @param conf
 *            mapservice config object
 */
function addWMS(conf) {
	if (conf.layers.length > 1) {
		// meer dan 1 layer voor deze WMS
		for ( var ly = 0; ly < conf.layers.length; ly++) {
			var lyr = new OpenLayers.Layer.WMS(conf.naam + ':'
					+ conf.layers[ly], conf.url, {
				layers : conf.layers[ly],
				transparent : true,
				format : 'image/png'
			}, {
				isBaseLayer : false,
				visibility : false,
				singleTile : true,
				transitionEffect : 'resize'
			});
			mapPanel.map.addLayer(lyr);
		}
	} else {
		// 1 layer voor deze WMS
		var lyr = new OpenLayers.Layer.WMS(conf.naam, conf.url, {
			layers : conf.layers,
			transparent : true,
			format : 'image/png'
		}, {
			isBaseLayer : false,
			visibility : false,
			singleTile : true,
			transitionEffect : 'resize'
		});
		mapPanel.map.addLayer(lyr);
	}
}

function addWFS(conf) {
	OpenLayers.Console.error('Niet geimplementeerd: toevoegen WFS: '
			+ conf.type + 'layer: ', conf.naam);
}

/**
 * toevoegen van de WMTS laag aan de kaart, uitgangspunt is opmaak volgens de
 * Nederlandse tiling richtlijn (13 levels in RD).
 * 
 * @param conf
 *            mapservice config object
 */
function addWMTS(conf) {
	var matrixIds = new Array(13);
	for ( var i = 0; i < 13; ++i) {
		matrixIds[i] = "EPSG:28992:" + i;
	}

	var lyr = new OpenLayers.Layer.WMTS({
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

function addOLS(conf) {
	OpenLayers.Console.error('Niet geimplementeerd: toevoegen OLS: '
			+ conf.type + 'layer: ', conf.naam);
}

/** map panel. */
var mapPanel;
/** capabilities panel. */
var capsPanel;
/** tabbed panel. */
var tabs;

/** active/selected layer. */
var activeLyr = {
	name : '',
	url : '',
	layer : ''
};

/**
 * capabilities (of wat daar voor door gaat) document voor de layer ophalen.
 * 
 * @param layer
 *            een OpenLayers.Layer type
 */
function getCapabilities(layer) {
	var url = '';
	if (typeof layer == 'undefined') {
		return;
	} else if (layer.CLASS_NAME === 'OpenLayers.Layer.TMS') {
		// TMS is een bijzonder geval
		url = layer.getFullRequestString() + layer.serviceVersion;
	} else {
		// zou moeten werken voor alle OWS
		url = layer.getFullRequestString({
			"REQUEST" : "GetCapabilities"
		});
	}

	tabs.activate(capsPanel);
	var updtr = capsPanel.getUpdater();
	updtr.setRenderer({
		/* override render; bepaalde char's worden vervangen door html entities */
		render : function(el, response, updateManager, callback) {
			var filt = response.responseText;
			// filt = filt.replace('<?xml version="1.0" ?>', '');
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
											new OpenLayers.Control.Navigation(),
											new OpenLayers.Control.ScaleLine(),
											new OpenLayers.Control.KeyboardDefaults() ],
									fractionalZoom : false
								}),
						region : "center",
						border : true,
						title : "Kaart",
						layers : [
								new OpenLayers.Layer.TMS(
										"BRT Achtergrondkaart (TMS)",
										"http://test.geodata.nationaalgeoregister.nl/tiles/service/tms/",
										{
											layername : 'brtachtergrondkaart',
											type : 'png8'
										}),
								new OpenLayers.Layer.TMS(
										"Top10NL (TMS)",
										"http://test.geodata.nationaalgeoregister.nl/tiles/service/tms/",
										{
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

			// WMS feature info control
			var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo({
				// url : activeLyr.url,
				drillDown : false,
				queryVisible : true,
				maxFeatures : 20
			});

			featureInfo.events
					.on({
						getfeatureinfo : function(event) {
							new GeoExt.Popup({
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
								html : event.text
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
				maxFeatures : 20
			});

			wmtsfeatureInfo.events
					.on({
						getfeatureinfo : function(event) {
							new GeoExt.Popup({
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
								html : event.text
							}).show();
						},
						nogetfeatureinfo : function(event) {
							OpenLayers.Console
									.error('Er is geen databron voor feature informatie.');
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
											featureInfo.deactivate();
											wmtsfeatureInfo.deactivate();
											// OpenLayers.Console
											// .info(node.text
											// + " is nu de actieve laag.");
											// info control
											activeLyr.name = node.text;
											activeLyr.url = node.layer.url;
											activeLyr.layer = node.layer;
											// test voor type en juiste
											// control activeren
											if (node.layer.CLASS_NAME === 'OpenLayers.Layer.WMTS') {
												wmtsfeatureInfo.activate();
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
				autoLoad : 'versie.jsp'
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