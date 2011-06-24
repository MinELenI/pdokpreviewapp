<%@ page language="java" contentType="application/json; charset=UTF-8"
	pageEncoding="UTF-8"
	import="java.io.BufferedReader,java.io.FileReader,java.util.StringTokenizer"%>
<%
    // geeft een lijst van de services in het formaat services:[{url:xxxx,type:}]
    response.setBufferSize(8192);
    response.setContentType("application/json");
    StringBuilder sb = new StringBuilder();
    // inlezen config file
    BufferedReader input = new BufferedReader(new FileReader(
            getServletContext().getRealPath("services.txt")));

    String line = "";
    String[] items = {};
    String[] kv = {};

    // parsen config en samenstellen json
    sb.append("{services:[");
    while ((line = input.readLine()) != null) {
        if (line.startsWith("//"))
            continue;
        if (line.startsWith("/*"))
            continue;
        items = line.split(";");
        sb.append("{");
        for (int i = 0; i < items.length; i++) {
            kv = items[i].split("=");
            if (kv[0].trim().equalsIgnoreCase("layers")) {
                sb.append("'" + kv[0].trim() + "':['" + kv[1].trim().replace(",","','")
                        + "'],");
            } else {
                sb.append("'" + kv[0].trim() + "':'" + kv[1].trim()
                        + "',");
            }
        }
        if (sb.lastIndexOf(",") == sb.length() - 1) {
            // als laatste char een komma is, die er af halen
            sb.deleteCharAt(sb.length() - 1);
        }
        sb.append("},");
    }
    input.close();
    if (sb.lastIndexOf(",") == sb.length() - 1) {
        // als laatste char een komma is, die er af halen
        sb.deleteCharAt(sb.length() - 1);
    }
    sb.append("]}");
    response.getWriter().write(sb.toString());
    response.flushBuffer();
%>