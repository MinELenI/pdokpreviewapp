/*
 * instellingen voor de PDOK Preview Applicatie.
 * @author mprins 
 */
/**
 * Voor uitrol op PDOK infrastuctuur kan de proxy weg/uit, de proxy.jsp kan dan
 * ook uit de .war gevist worden. In dat geval dienen alle services (dus
 * onderstaande achtergrond én de voorgrond kaarten uit services.txt in
 * hetzelfde domein/omgeving als de applicatie te zitten, dwz alles op bijv.
 * test.geodata.nationaalgeoregister.nl)
 * 
 * {String}
 */
OpenLayers.ProxyHost = 'proxy.jsp?';
/**
 * url voor de brt achtergrondkaart (TMS)
 * 
 * {String}
 */
var BRT_ACHTERGRONDKAART_TMS_URL = 'http://geodata.nationaalgeoregister.nl/tiles/service/tms/';
/**
 * url voor de top10 achtergrondkaart (TMS)
 * 
 * {String}
 */
var TOP10NL_TMS_URL = 'http://geodata.nationaalgeoregister.nl/tiles/service/tms/';
/**
 * Workround voor verschillen in namespaces. Als een namespace eindigd op .nl/
 * in plaats van .nl deze in de array opnemen. Zie bugreport
 * https://issues.e-id.nl/browse/GPDOK-745
 * 
 * {Array}
 */
var NAMESPACE_SLASH_EXCEPTIONS = [ 'natura2000' ];