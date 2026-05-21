/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 94.2103558706056, "KoPercent": 5.789644129394408};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4927232220357618, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6454323470267165, 500, 1500, "POST Reserve"], "isController": false}, {"data": [0.30990085375929494, 500, 1500, "GET Home"], "isController": false}, {"data": [0.7339677891654466, 500, 1500, "POST Purchase"], "isController": false}, {"data": [0.7605017069912424, 500, 1500, "POST Confirmation"], "isController": false}, {"data": [0.022005612169546596, 500, 1500, "Compra Passagem"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 27791, 1609, 5.789644129394408, 2583.765679536539, 241, 34243, 604.0, 15534.900000000001, 21028.0, 21047.0, 100.32091429891597, 586.1134900140693, 20.279211966331072], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Reserve", 6962, 272, 3.9069232979029014, 2073.795461074405, 248, 34217, 484.0, 4237.7, 15475.699999999999, 21041.0, 25.559316558119725, 179.44866370128236, 5.996272867364695], "isController": false}, {"data": ["GET Home", 7262, 1258, 17.32305150096392, 6117.82484164142, 406, 34243, 1569.0, 21030.0, 21040.0, 21051.0, 26.21461910829865, 111.76507362596156, 2.5398570866468604], "isController": false}, {"data": ["POST Purchase", 6830, 67, 0.9809663250366032, 1099.8790629575408, 243, 21084, 416.0, 1925.5000000000027, 3666.7999999999993, 19542.709999999377, 25.062748609255973, 163.42822316510774, 6.7373982743215075], "isController": false}, {"data": ["POST Confirmation", 6737, 12, 0.1781208252931572, 805.6776013062193, 241, 21058, 399.0, 1620.3999999999996, 2776.899999999995, 5511.399999999998, 24.59971153670604, 138.71200511657202, 5.2756804219232105], "isController": false}, {"data": ["Compra Passagem", 6771, 1005, 14.84271156402304, 9206.99512627382, 1026, 88317, 4165.0, 25150.8, 30847.599999999962, 58248.19999999997, 24.43822049619946, 574.722994419651, 20.016313238542445], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 1565, 97.26538222498446, 5.631319491921845], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.blazedemo.com:443 failed to respond", 1, 0.062150403977625855, 0.003598287215285524], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Uma tentativa de conex&atilde;o falhou porque o componente conectado n&atilde;o respondeu\\r\\ncorretamente ap&oacute;s um per&iacute;odo de tempo ou a conex&atilde;o estabelecida falhou\\r\\nporque o host conectado n&atilde;o respondeu", 43, 2.6724673710379117, 0.15472635025727755], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 27791, 1609, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 1565, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Uma tentativa de conex&atilde;o falhou porque o componente conectado n&atilde;o respondeu\\r\\ncorretamente ap&oacute;s um per&iacute;odo de tempo ou a conex&atilde;o estabelecida falhou\\r\\nporque o host conectado n&atilde;o respondeu", 43, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.blazedemo.com:443 failed to respond", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["POST Reserve", 6962, 272, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 269, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Uma tentativa de conex&atilde;o falhou porque o componente conectado n&atilde;o respondeu\\r\\ncorretamente ap&oacute;s um per&iacute;odo de tempo ou a conex&atilde;o estabelecida falhou\\r\\nporque o host conectado n&atilde;o respondeu", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home", 7262, 1258, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 1217, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Uma tentativa de conex&atilde;o falhou porque o componente conectado n&atilde;o respondeu\\r\\ncorretamente ap&oacute;s um per&iacute;odo de tempo ou a conex&atilde;o estabelecida falhou\\r\\nporque o host conectado n&atilde;o respondeu", 40, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.blazedemo.com:443 failed to respond", 1, "", "", "", ""], "isController": false}, {"data": ["POST Purchase", 6830, 67, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 67, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Confirmation", 6737, 12, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
