OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;
OpenLayers.Util.onImageLoadErrorColor = 'transparent';
OpenLayers.ProxyHost = 'proxy.jsp?';
/**
 * toevoegen van untiled WMS aan de kaart.
 */
function addWMS(conf) {
	OpenLayers.Console.debug('adding layer: ', conf.naam);
	if (conf.layers.length > 1) {
		// meer dan 1 layer voor deze WMS
		for ( var ly = 0; ly < conf.layers.length; ly++) {
			var lyr = new OpenLayers.Layer.WMS(conf.naam + ':'
					+ conf.layers[ly], conf.url, {
				layers : conf.layers[ly],
				transparent : true,
				format : 'image/png',
				singleTile : true
			}, {
				isBaseLayer : false,
				visibility : false
			});
			mapPanel.map.addLayer(lyr);
		}
	} else {
		// 1 layer voor deze WMS
		var lyr = new OpenLayers.Layer.WMS(conf.naam, conf.url, {
			layers : conf.layers,
			transparent : true,
			format : 'image/png',
			singleTile : true
		}, {
			isBaseLayer : false,
			visibility : false
		});
		mapPanel.map.addLayer(lyr);
	}
}

function addWFS(conf) {
	OpenLayers.Console.debug('could be adding ' + conf.type + 'layer: ',
			conf.naam);
}

function addWMTS(conf) {
	OpenLayers.Console.debug('could be adding ' + conf.type + 'layer: ',
			conf.naam);
}

function addOLS(conf) {
	OpenLayers.Console.debug('could be adding ' + conf.type + 'layer: ',
			conf.naam);
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
	url : ''
};

function getCapabilities(layer) {
	// OpenLayers.Console.debug(tabs, capsPanel);
	tabs.activate(capsPanel);
	var url = layer.getFullRequestString({
		"REQUEST" : "GetCapabilities"
	});
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
						layers : [ new OpenLayers.Layer.TMS(
								"BRT Achtergrondkaart (TMS)",
								"http://test.geodata.nationaalgeoregister.nl/tms/",
								{
									layername : 'brtachtergrondkaart',
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
			// OpenLayers.Console.debug('Laden van configuratie json.');
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
						OpenLayers.Console
								.debug('Klaar met laden configuratie json');
						// OpenLayers.Console.debug('records loaded: ' +
						// servicesStore.getCount());
						servicesStore.each(function(s) {
							// OpenLayers.Console.log('data: ', s.data);
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
						// OpenLayers.Console.debug('proxy: ', proxy);
						// OpenLayers.Console.debug('type: ', type);
						// OpenLayers.Console.debug('action: ', action);
						OpenLayers.Console.error('Fout: ', exception);
					},
					beforeload : function(servicesStore, options) {
						// OpenLayers.Console.debug('options: ', options);
					}
				},
				sortInfo : {
					field : 'naam',
					direction : 'DESC'
				}
			});

			// feature info control
			var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo({
				url : activeLyr.url,
				maxFeatures : 20
			});

			featureInfo.events
					.on({
						getfeatureinfo : function(event) {
							OpenLayers.Console.debug('event: ', event);
							new GeoExt.Popup({
								title : "Feature info voor layer: "
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
						beforegetfeatureinfo : function(event) {
						},
						exception : function(event) {
							OpenLayers.Console.error('feature info fout: ',
									event.error);
						},
						nogetfeatureinfo : function(event) {
							OpenLayers.Console
									.warning('Er is geen databron voor feature informatie.');
						}
					});
			mapPanel.map.addControl(featureInfo);

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
			tree = new Ext.tree.TreePanel({
				border : true,
				region : "west",
				title : "Services",
				width : 200,
				split : true,
				collapsible : true,
				collapseMode : "mini",
				autoScroll : true,
				plugins : [ new GeoExt.plugins.TreeNodeRadioButton({
					listeners : {
						"radiochange" : function(node) {
							featureInfo.deactivate();
							OpenLayers.Console.info(node.text
									+ " is nu de actieve laag.");
							// OpenLayers.Console.debug('node:', node);
							// info control
							activeLyr.name = node.text;
							activeLyr.url = node.layer.url;
							featureInfo.url = activeLyr.url;
							featureInfo.activate();
						}
					}
				}) ],
				loader : new Ext.tree.TreeLoader({
					// applyLoader has to be set to false to not
					// interfer with loaders
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
						OpenLayers.Console.log(node.layer.name
								+ " is now the the active layer.");
						activeLyr.name = node.layer.name;
						activeLyr.url = node.layer.url;
					},
					"click" : function(node, event) {
						OpenLayers.Console.debug(node.layer.name
								+ " was clicked", node);
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

			tabs = new Ext.TabPanel({
				activeTab : 0,
				region : 'south',
				collapsible : true,
				collapseMode : "mini",
				split : true,
				height : 200,
				bodyStyle : 'padding:5px',
				items : [ legendPanel, capsPanel ]
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