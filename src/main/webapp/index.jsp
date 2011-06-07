<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="nl" lang="nl">
<head>
<title>PDOK Preview applicatie</title>
<meta name="description" content="PDOK preview applicatie." />
<meta name="keywords" content="PDOK preview applicatie, PDOK, services" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="shortcut icon" href="static/img/favicon.ico" />
<link rel="stylesheet" type="text/css"
	href="http://extjs.cachefly.net/ext-3.3.1/resources/css/ext-all.css" media="all" />
<link rel="stylesheet" type="text/css"
	href="http://extjs.cachefly.net/ext-3.3.1/resources/css/xtheme-gray.css" media="all" />
<link rel="stylesheet" href="static/css/style.css" type="text/css"
	media="all" />
<!--[if lte IE 7]>
		<link rel="stylesheet" href="static/css/ie.css" type="text/css" media="all" />
	<![endif]-->
<!--[if gte IE 8]>
		<link rel="stylesheet" href="static/css/ie-8.css" type="text/css" media="all" />
	<![endif]-->
<link rel="stylesheet" href="static/css/print.css" type="text/css"
	media="print" />
</head>
<body>

	<p class="notabene">
		<img src="static/img/logo.png" alt="logo" height="48" id="logo"
			title="logo" width="48" class="logo" />Voor deze applicatie is een
		moderne browser met CSS en JavaScript ondersteuning nodig, het kan
		even duren voordat de applicatie volledig is geladen.
	</p>
	<div id="desc" class="uitleg">
		<h1>PDOK Preview applicatie</h1>
		<p>Aan de linkerkant van de pagina bevindt zich een lijst met
			services.</p>
		<p>
			Een service kan "aangezet" worden met de checkbox, de legenda
			(onderaan het scherm) wordt dan ook bijgewerkt (mits het type service
			dat ondersteund). <em>Let op: Veel services zijn schaal
				afhankelijk; WFS services worden pas zichtbaar boven nivo 7.</em>
		</p>
		<p>Met de radio button kan een service "actief" worden gemaakt,
			van een actieve service kan feature informatie worden opgevraagd.</p>
		<p>Door een service te selecteren wordt het capabilities document
			opgehaald en getoond</p>
	</div>


	<script src="http://extjs.cachefly.net/ext-3.3.1/adapter/ext/ext-base.js"
		type="text/javascript"></script>
	<script src="http://extjs.cachefly.net/ext-3.3.1/ext-all.js" type="text/javascript"></script>
	<script src="static/OpenLayers-trunk/OpenLayers.js"
		type="text/javascript"></script>
	<script src="static/GeoExt-1.0/script/GeoExt.js" type="text/javascript"></script>
	<script src="static/js/LoadingPanel.js" type="text/javascript"></script>
	<script src="static/js/settings.js" type="text/javascript"></script>
	<script src="static/js/map.js" type="text/javascript"></script>
</body>
</html>
