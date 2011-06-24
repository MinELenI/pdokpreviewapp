<?xml version="1.0" encoding="UTF-8" ?>
<jsp:root xmlns:jsp="http://java.sun.com/JSP/Page" version="2.0">
	<jsp:directive.page
		import="java.io.File,java.util.jar.Manifest,java.io.FileInputStream,java.util.jar.Attributes,java.util.Date" />
	<jsp:directive.page language="java"
		contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" />
	<jsp:directive.page session="false" />
	<jsp:text>
		<![CDATA[<?xml version="1.0" encoding="UTF-8" ?> ]]>
	</jsp:text>
	<jsp:text>
		<![CDATA[<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> ]]>
	</jsp:text>
	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="nl" lang="nl">
<jsp:scriptlet>/* info uitlezen/ophalen uit de manifest */
            String appServerHome = getServletContext().getRealPath("/");
            File manifestFile = new File(appServerHome, "META-INF/MANIFEST.MF");
            Manifest mf = new Manifest();
            mf.read(new FileInputStream(manifestFile));
            Attributes atts = mf.getMainAttributes();</jsp:scriptlet>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="description" content="PDOK preview applicatie." />
<meta name="keywords"
	content="PDOK preview applicatie, PDOK, services, versieinformatie" />
<link rel="shortcut icon" href="static/img/favicon.ico" />
<link rel="stylesheet" type="text/css"
	href="http://extjs.cachefly.net/ext-3.4.0/resources/css/ext-all.css"
	media="all" />
<link rel="stylesheet" type="text/css"
	href="http://extjs.cachefly.net/ext-3.4.0/resources/css/xtheme-gray.css"
	media="all" />
<link rel="stylesheet" href="static/css/style.css" type="text/css"
	media="all" />
<!--[if gte IE 8]>
		<link rel="stylesheet" href="static/css/ie-8.css" type="text/css" media="all" />
	<![endif]-->
<link rel="stylesheet" href="static/css/print.css" type="text/css"
	media="print" />

<title>Versie informatie voor <jsp:expression>atts.getValue("Implementation-Title")</jsp:expression>
	<jsp:expression>atts.getValue("Implementation-Version")</jsp:expression>.<jsp:expression>atts.getValue("Implementation-Build")</jsp:expression>
</title>
</head>
<body>
	<div id="versie_info" class="uitleg">
		<h1><jsp:expression>atts.getValue("Implementation-Title")</jsp:expression></h1>
		<p>
			<img src="static/img/logo.png" alt="logo" height="48" id="logo"
				title="logo" width="48" class="logo" /> Versie:
			<jsp:expression>atts.getValue("Implementation-Version")</jsp:expression>
		</p>
		<p>
			Build:
			<jsp:expression>atts.getValue("Implementation-Build")</jsp:expression>
		</p>
		<p>
			Bron:
			<jsp:expression>atts.getValue("bron")</jsp:expression>
			(SCM revisie:
			<jsp:expression>atts.getValue("SCM-Revision")</jsp:expression>)
		</p>
		<!-- <p>
			Deze applicatie draait op host:
			<jsp:expression>request.getLocalAddr()</jsp:expression>:<jsp:expression>request.getLocalPort()</jsp:expression>
			(<jsp:expression>request.getLocalName()</jsp:expression>) en is benaderd vanaf:
			<jsp:expression>request.getRemoteAddr()</jsp:expression>:<jsp:expression>request.getRemotePort()</jsp:expression>
			(<jsp:expression>request.getRemoteHost()</jsp:expression>) op <jsp:expression>new Date()</jsp:expression>
		</p>
		<p>
			Server info:
			<jsp:expression>getServletContext().getServerInfo()</jsp:expression>,
			Java Servlet API <jsp:expression>getServletContext().getMajorVersion()</jsp:expression>.<jsp:expression>getServletContext().getMinorVersion()</jsp:expression>
		</p> -->
	</div>
</body>
	</html>
</jsp:root>