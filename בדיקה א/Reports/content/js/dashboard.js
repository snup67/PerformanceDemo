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

    var data = {"OkPercent": 53.17340644276902, "KoPercent": 46.82659355723098};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2721041809458533, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "10.100.165.1 Swap"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request-Login"], "isController": false}, {"data": [0.006756756756756757, 500, 1500, "10.100.165.1 Network I\/O"], "isController": false}, {"data": [0.013513513513513514, 500, 1500, "10.100.165.1 CPU"], "isController": false}, {"data": [1.0, 500, 1500, "10.100.165.1 Disks I\/O"], "isController": false}, {"data": [0.0, 500, 1500, "10.100.165.1 TCP"], "isController": false}, {"data": [0.6370023419203747, 500, 1500, "HTTP Request-Login-0"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request-Login-1"], "isController": false}, {"data": [0.0, 500, 1500, "10.100.165.1 Memory"], "isController": false}, {"data": [0.4328314997104806, 500, 1500, "HTTP Request-LoginPage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14590, 6832, 46.82659355723098, 587548.8074708733, -3000, 290203000, 2694.5999999999985, 3946.0, 76180.00000000029, 0.05026301994114177, 0.0661321167294526, 0.013419840373020095], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["10.100.165.1 Swap", 148, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.9856087799095639, 0.0, 0.0], "isController": false}, {"data": ["HTTP Request-Login", 3416, 3416, 100.0, 1655.0269320843047, 155, 5871, 3292.0, 3949.5999999999913, 5384.2499999999945, 24.433858346565955, 33.50111046736191, 12.073762034533567], "isController": false}, {"data": ["10.100.165.1 Network I\/O", 148, 0, 0.0, 5.772076351351353E7, 0, 290203000, 2.387342E8, 2.7718725E8, 2.8857570999999994E8, 5.098647723215222E-4, 0.0, 0.0], "isController": false}, {"data": ["10.100.165.1 CPU", 148, 0, 0.0, 9828.040540540542, 1007, 30126, 18226.799999999996, 21975.05, 28447.25999999997, 0.9112907694865369, 0.0, 0.0], "isController": false}, {"data": ["10.100.165.1 Disks I\/O", 148, 0, 0.0, -2997.459459459459, -3000, -2964, -2987.7, -2980.0, -2964.98, 1.0057217412576958, 0.0, 0.0], "isController": false}, {"data": ["10.100.165.1 TCP", 148, 0, 0.0, 50263.513513513506, 28000, 78000, 68000.0, 71000.0, 77019.99999999999, 0.7866189734622396, 0.0, 0.0], "isController": false}, {"data": ["HTTP Request-Login-0", 3416, 0, 0.0, 799.7277517564381, 55, 3335, 1757.0, 2186.749999999998, 2842.49, 24.47499838791726, 10.540502235421398, 6.429467349950921], "isController": false}, {"data": ["HTTP Request-Login-1", 3416, 3416, 100.0, 854.9701405152229, 76, 3411, 1721.0, 2099.749999999998, 3229.0899999999983, 24.48306755061817, 23.024603565669235, 5.666491220211431], "isController": false}, {"data": ["10.100.165.1 Memory", 148, 0, 0.0, 37098.83108108105, 37010, 37191, 37169.0, 37182.0, 37190.51, 0.7900032560945015, 0.0, 0.0], "isController": false}, {"data": ["HTTP Request-LoginPage", 3454, 0, 0.0, 1278.9600463231031, 151, 3697, 2465.0, 2839.75, 3389.1499999999987, 24.639221588923053, 70.11590987316579, 3.705507934271631], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404", 6832, 100.0, 46.82659355723098], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14590, 6832, "404", 6832, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["HTTP Request-Login", 3416, 3416, "404", 3416, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request-Login-1", 3416, 3416, "404", 3416, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
