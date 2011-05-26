/**
 * instellingen voor de preview app.
 */
/*
 * voor uitrol op PDOK infrastuctuur kan de proxy weg/uit, de jsp kan dan ook
 * uit de .war gevist worden. In dat geval dienen alle services (dus
 * onderstaande achtergrond én de voorgrond kaarten uit services.txt in
 * hetzelfde domein/omgeving als de applicatie te zitten, dwz alles op bijv.
 * test.geodata.nationaalgeoregister.nl )
 */
OpenLayers.ProxyHost = 'proxy.jsp?';
/**
 * url voor de brt achtergrondkaart
 */
var BRT_ACHTERGRONDKAART_TMS_URL = 'http://geodata.nationaalgeoregister.nl/tiles/service/tms/';
/**
 * url voor de top10 achtergrondkaart
 */
var TOP10NL_TMS_URL = 'http://geodata.nationaalgeoregister.nl/tiles/service/tms/';