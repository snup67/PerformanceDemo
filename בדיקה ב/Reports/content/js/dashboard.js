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
    cell.colSpan = 6;
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

    var data = {"OkPercent": 54.27311156037493, "KoPercent": 45.72688843962507};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.20520124977026283, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "10.100.165.1 Swap"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request-Login"], "isController": false}, {"data": [0.006756756756756757, 500, 1500, "10.100.165.1 Network I\/O"], "isController": false}, {"data": [0.02027027027027027, 500, 1500, "10.100.165.1 CPU"], "isController": false}, {"data": [1.0, 500, 1500, "10.100.165.1 Disks I\/O"], "isController": false}, {"data": [0.0, 500, 1500, "10.100.165.1 TCP"], "isController": false}, {"data": [0.47266881028938906, 500, 1500, "HTTP Request-Login-0"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request-Login-1"], "isController": false}, {"data": [0.0, 500, 1500, "10.100.165.1 Memory"], "isController": false}, {"data": [0.2992094861660079, 500, 1500, "HTTP Request-LoginPage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10882, 4976, 45.72688843962507, 718763.6043925707, -3000, 296822000, 3751.4000000000015, 7034.0, 1.3500480000000004E7, 0.03665584254870546, 0.0472335269596867, 0.009564244429424374], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["10.100.165.1 Swap", 148, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.9892452994138053, 0.0, 0.0], "isController": false}, {"data": ["HTTP Request-Login", 2488, 2488, 100.0, 2374.8151125401914, 186, 7237, 4120.299999999999, 5514.799999999996, 7045.190000000004, 17.78387728552844, 24.383362996955015, 8.787736236794329], "isController": false}, {"data": ["10.100.165.1 Network I\/O", 148, 0, 0.0, 5.264845945945946E7, 0, 296822000, 2.367797E8, 2.7729E8, 2.9523538E8, 4.985356341026817E-4, 0.0, 0.0], "isController": false}, {"data": ["10.100.165.1 CPU", 148, 0, 0.0, 8337.189189189185, 751, 23618, 17128.0, 18756.449999999993, 23457.769999999997, 0.9417993458312652, 0.0, 0.0], "isController": false}, {"data": ["10.100.165.1 Disks I\/O", 148, 0, 0.0, -2999.310810810808, -3000, -2980, -2998.0, -2994.0, -2982.45, 1.0095153644145836, 0.0, 0.0], "isController": false}, {"data": ["10.100.165.1 TCP", 148, 0, 0.0, 49412.16216216215, 28000, 71000, 65099.99999999999, 67549.99999999999, 71000.0, 0.7974309791159292, 0.0, 0.0], "isController": false}, {"data": ["HTTP Request-Login-0", 2488, 0, 0.0, 1179.0217041800656, 56, 4740, 2148.4999999999995, 2860.1999999999935, 4481.110000000001, 17.86214273919692, 7.692582957017425, 4.692301168792942], "isController": false}, {"data": ["HTTP Request-Login-1", 2488, 2488, 100.0, 1195.3922829582004, 86, 4701, 2429.2, 2800.7499999999986, 4019.870000000002, 17.835125448028673, 16.772681451612904, 4.127856182795699], "isController": false}, {"data": ["10.100.165.1 Memory", 148, 0, 0.0, 37139.317567567574, 36920, 37254, 37237.0, 37249.0, 37254.0, 0.7922572909083123, 0.0, 0.0], "isController": false}, {"data": ["HTTP Request-LoginPage", 2530, 0, 0.0, 1659.2237154150193, 182, 5396, 2815.0, 3018.8999999999996, 3968.0, 17.972834735167083, 51.145351970973515, 2.702945848843487], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404", 4976, 100.0, 45.72688843962507], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10882, 4976, "404", 4976, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["HTTP Request-Login", 2488, 2488, "404", 2488, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request-Login-1", 2488, 2488, "404", 2488, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
