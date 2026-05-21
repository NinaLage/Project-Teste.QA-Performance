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

    var data = {"OkPercent": 75.10264541848512, "KoPercent": 24.89735458151488};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4767410390912926, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.792844663278272, 500, 1500, "POST Reserve"], "isController": false}, {"data": [0.7937217955822975, 500, 1500, "GET Home"], "isController": false}, {"data": [0.7917181213400789, 500, 1500, "POST Purchase"], "isController": false}, {"data": [0.0, 500, 1500, "POST Confirmation"], "isController": false}, {"data": [0.0, 500, 1500, "Compra Passagem"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100589, 25044, 24.89735458151488, 811.3293799520784, 164, 10494, 363.0, 1468.0, 3895.9000000000015, 6478.990000000002, 193.78435183990044, 1165.3626950908777, 41.041286534801195], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Reserve", 25184, 0, 0.0, 803.9280495552784, 245, 10494, 369.0, 1614.9000000000015, 3765.850000000002, 6955.960000000006, 48.79485390994343, 351.7138244255212, 11.91280613035728], "isController": false}, {"data": ["GET Home", 25262, 2, 0.00791702953052015, 810.8953764547541, 165, 10256, 359.0, 1659.0, 3863.0, 7018.880000000019, 48.66752845938818, 226.06841005504043, 5.703225991334552], "isController": false}, {"data": ["POST Purchase", 25103, 2, 0.00796717523801936, 818.9119228777427, 164, 10286, 367.0, 1644.0, 3935.7000000000044, 7071.990000000002, 48.66506924735185, 319.2925287902602, 13.211805908949037], "isController": false}, {"data": ["POST Confirmation", 25040, 25040, 100.0, 811.6095047923335, 237, 10213, 367.0, 1636.800000000003, 3836.850000000002, 7011.950000000008, 48.57005415638626, 274.15530215413236, 10.434972572661112], "isController": false}, {"data": ["Compra Passagem", 25040, 25040, 100.0, 3245.613698083057, 1045, 26442, 2096.5, 7407.9000000000015, 8820.95, 11865.94000000001, 48.384696986970525, 1164.0738597882396, 41.01359080536174], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to equal /\\n\\n****** received  : [[[&lt;!doctype html&gt;\\n&lt;html lang=&quot;en&quot;&gt;\\n&lt;head&gt;\\n    &lt;meta charset=&quot;utf-8&quot;&gt;\\n    &lt;title&gt;BlazeDemo Confirmation...]]]\\n\\n****** comparison: [[[Thank you for your purchase today!                                                                     ]]]\\n\\n/", 25040, 99.98402811052547, 24.893378003559036], "isController": false}, {"data": ["429/Too Many Requests", 4, 0.015971889474524836, 0.003976577955840102], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100589, 25044, "Test failed: text expected to equal /\\n\\n****** received  : [[[&lt;!doctype html&gt;\\n&lt;html lang=&quot;en&quot;&gt;\\n&lt;head&gt;\\n    &lt;meta charset=&quot;utf-8&quot;&gt;\\n    &lt;title&gt;BlazeDemo Confirmation...]]]\\n\\n****** comparison: [[[Thank you for your purchase today!                                                                     ]]]\\n\\n/", 25040, "429/Too Many Requests", 4, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET Home", 25262, 2, "429/Too Many Requests", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Purchase", 25103, 2, "429/Too Many Requests", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Confirmation", 25040, 25040, "Test failed: text expected to equal /\\n\\n****** received  : [[[&lt;!doctype html&gt;\\n&lt;html lang=&quot;en&quot;&gt;\\n&lt;head&gt;\\n    &lt;meta charset=&quot;utf-8&quot;&gt;\\n    &lt;title&gt;BlazeDemo Confirmation...]]]\\n\\n****** comparison: [[[Thank you for your purchase today!                                                                     ]]]\\n\\n/", 25040, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
