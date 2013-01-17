var appVars = {};

function initializeAppVars() {
    appVars = {
        thresholds: { cpu: 25, memory: 80, disk_busy: 50, disk: 90, network: 50}, 
        colors: {blue: '#0cf', red: '#f00', green: '#008000', grey: '#999', grey_darker: '#333'},
        servers: [],
        applicationMetrics: [],
        businessMetrics: [],
        serverTags: []
    }
    
    getAppVarsServers();
}
function getAppVarsServers() {
    $(".widget-settings-initializing").html("Initializing (Servers)");
    $.ajax({
        type: "GET",
        url: "/api/servers/data/",
        data: {},
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
            appVars.servers = json_data;
            getAppVarsApplicationMetrics();
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
            getAppVarsApplicationMetrics();
       	}
    });
}
function getAppVarsApplicationMetrics() {
    $(".widget-settings-initializing").html("Initializing (Application Metrics)");
    $.ajax({
        type: "GET",
        url: "/api/application/metrics/list/",
        data: {},
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
            appVars.applicationMetrics = json_data;
            getAppVarsServerTags();
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
            getAppVarsServerTags();
       	}
    });
}
function getAppVarsBusinessMetrics() {
    $(".widget-settings-initializing").html("Initializing (Business Metrics)");
    $.ajax({
        type: "GET",
        url: "/api/business/metrics/list/",
        data: {},
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
            appVars.businessMetrics = json_data;
            getAppVarsServerTags();
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
            getAppVarsServerTags();
       	}
    });
}
function getAppVarsServerTags() {
    $(".widget-settings-initializing").html("Initializing (Server Tags)");
    $.ajax({
        type: "GET",
        url: "/api/server/tags/data/",
        data: {},
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
            appVars.serverTags = json_data;
            hideInitializing();
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
            hideInitializing();
       	}
    });
}

function initializeWidgets() {
    showInitializing();
    
    $(".icon-setting").click(function() {
        showSettings($(this).data("id"));
    });
    
    $(".widget-settings .button").click(function() {
        if ($(this).hasClass("save")) {
            saveSettings();
        }
        hideSettings();
    });
    
    $(".donut-chart-container .chart-container").click(function() {
        // Get widget data...
        var widgetData = $("#widget_" + $(this).data("id")).data("widget"),
            metric = $(this).data("metric"),
            serverId = $(this).data("serverid");
            
        // Set new data...
        widgetData.config.metric = metric;
        widgetData.config.serverId = serverId;
        widgetData.timerIntervalCounter = 0;
        
        // Refresh widget...
        displaySystemWidget(widgetData, true);
    });
    
    $("div.widget").each(function(index) {
        var widgetData = $(this).data("widget");

        switch (widgetData.type) {
            case "application":
                displayApplicationWidget(widgetData, true);
                break;
            
            case "business":
                displayBusinessWidget(widgetData, true);
                break;
                
            case "system":
                displaySystemWidget(widgetData, true);
                break;
        }
    });
    
    var timerInterval = setInterval(function() { displayWidgetInterval(); }, 60000);
}

function showInitializing() {
    $(".widget-settings-background").show();
    $(".widget-settings-initializing").show();
}
function hideInitializing() {
    $(".widget-settings-initializing").hide();
    $(".widget-settings-background").hide();
}

function displayWidgetInterval() {
    $("div.widget").each(function(index) {
        var widgetData = $(this).data("widget");
        widgetData.timerIntervalCounter++;
        
        if (widgetData.timerIntervalCounter >= widgetData.timerInterval) {
            widgetData.timerIntervalCounter = 0;
            switch (widgetData.type) {
                case "application":
                    displayApplicationWidget(widgetData, false);
                    break;
            
                case "business":
                    displayBusinessWidget(widgetData, false);
                    break;
                
                case "system":
                    displaySystemWidget(widgetData, false);
                    break;
            }
        }
    });
}

function showSettings(widgetId) {
    var widgetData = $("#widget_" + widgetId).data("widget");
    $(".widget-settings").data("widget", widgetData);
    
    $("#widget_settings_title").val(widgetData.title);
    switch (widgetData.type) {
        case "application":
            $(".widget-settings .header").html("APPLICATION SETTINGS");
            $(".widget-settings .business-setting").hide();
            $(".widget-settings .system-setting").hide();
            $(".widget-settings .application-setting").show();
            
            // Build metric dropdown list...
            var optionsValues = "";
            $.each(appVars.applicationMetrics, function(app) {
        		optionsValues += '<option value="' + app + '">' + app + '</option>';
            });
        	$('#widget_settings_app_application').html(optionsValues);
        	
            $("#widget_settings_app_application").val(widgetData.config.application);
            $("#widget_settings_app_grain").val(widgetData.config.grain);
            $("#widget_settings_app_tick_agg").val(widgetData.config.tick_agg);
            $("#widget_settings_app_display_datapoints").val(widgetData.displayDataPoints);
            $("#widget_settings_app_number_format").val(widgetData.config.numberFormat);
            
            bindApplicationMetricList(widgetData.config.metric);
            break;
    
        case "business":
            $(".widget-settings .header").text("BUSINESS SETTINGS");
            $(".widget-settings .application-setting").hide();
            $(".widget-settings .system-setting").hide();
            $(".widget-settings .business-setting").show();
            
            $("#widget_settings_biz_metric_type").val(widgetData.config.metric_type);
            $("#widget_settings_biz_grain").val(widgetData.config.grain);
            $("#widget_settings_biz_tick_agg").val(widgetData.config.tick_agg);
            if (widgetData.config.hwb == "1") {
                $("#widget_settings_biz_hwb").attr('checked','checked');
            } else {
                $("#widget_settings_biz_hwb").removeAttr('checked');
            }
            $("#widget_settings_biz_display_datapoints").val(widgetData.displayDataPoints);
            $("#widget_settings_biz_number_format").val(widgetData.config.numberFormat);
            
            bindBusinessMetricList(widgetData.config.metric);
            break;
        
        case "system":
            $(".widget_settings .header").html("SYSTEM SETTINGS");
            $(".widget-settings .application-setting").hide();
            $(".widget-settings .business-setting").hide();
            $(".widget-settings .system-setting").show();
            
            // Build server tag dropdown list...
            var optionsValues = "";
            $.each(appVars.serverTags, function(index) {
        		optionsValues += '<option value="' + appVars.serverTags[index].id + '">' + appVars.serverTags[index].name + '</option>';
            });
        	$('#widget_settings_sys_server_tag').html(optionsValues);
        	
        	$("#widget_settings_sys_server_tag").val(widgetData.config.serverTagId);
        	$("#widget_settings_sys_metric").val(widgetData.config.metric);
            break;
    }
    
    $(".widget-settings-background").show();
    $(".widget-settings").show();
}

function bindApplicationMetricList(value) {
    var application = $("#widget_settings_app_application").val();
    var optionsValues = "";
    $.each(appVars.applicationMetrics[application], function(index) {
	    optionsValues += '<option value="' + appVars.applicationMetrics[application][index] + '">' + appVars.applicationMetrics[application][index] + '</option>';
	});
	$('#widget_settings_app_metric').html(optionsValues);
	if (value) {
        $("#widget_settings_app_metric").val(value);
    }
}

function bindBusinessMetricList(value) {
    var metric_type = $("#widget_settings_biz_metric_type").val();
    var displayStringToExtract = "biz." + metric_type + ".";
    
    $.ajax({
        type: "GET",
        url: "/api/business/metrics/list/",
        data: {
            "metric_type": $("#widget_settings_biz_metric_type").val()
        },
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
            // Build metric dropdown list...
            var optionsValues = "";
            $.each(json_data, function(index) {
                var displayMetric = json_data[index].substring(displayStringToExtract.length);
        		optionsValues += '<option value="' + json_data[index] + '">' + displayMetric + '</option>';
            });
        	$('#widget_settings_biz_metric').html(optionsValues);
        	
        	if (value) {
                $("#widget_settings_biz_metric").val(value);
            }
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
            // Need to handle errror...
       	}
    });
}

function saveSettings() {
    var settingsData = $(".widget-settings").data("widget");
    var widgetData = $("#widget_" + settingsData.id).data("widget");
    
    widgetData.title = $("#widget_settings_title").val();
    
    switch (widgetData.type) {
        case "application":
            widgetData.config.application = $("#widget_settings_app_application").val();
            widgetData.config.metric = $("#widget_settings_app_metric").val();
            widgetData.config.grain = $("#widget_settings_app_grain").val();
            widgetData.config.tick_agg = $("#widget_settings_app_tick_agg").val();
            widgetData.displayDataPoints = $("#widget_settings_app_display_datapoints").val();
            widgetData.config.numberFormat = $("#widget_settings_app_number_format").val();
            widgetData.timerInterval = getTimerInterval(widgetData.config.grain);
            widgetData.timerIntervalCounter = 0;
            displayApplicationWidget(widgetData, true);
            break;
    
        case "business":
            widgetData.config.metric_type = $("#widget_settings_biz_metric_type").val();
            widgetData.config.metric = $("#widget_settings_biz_metric").val();
            widgetData.config.grain = $("#widget_settings_biz_grain").val();
            widgetData.config.tick_agg = $("#widget_settings_biz_tick_agg").val();
            if($('#widget_settings_biz_hwb').prop('checked')) {
                widgetData.config.hwb = "1";
            } else {
                widgetData.config.hwb = "0";
            }
            widgetData.displayDataPoints = $("#widget_settings_biz_display_datapoints").val();
            widgetData.config.numberFormat = $("#widget_settings_biz_number_format").val();
            widgetData.timerInterval = getTimerInterval(widgetData.config.grain);
            widgetData.timerIntervalCounter = 0;
            displayBusinessWidget(widgetData, true);
            break;
        
        case "system":
            widgetData.config.serverTagId = parseInt($("#widget_settings_sys_server_tag").val());
            
            // Lets grab the first server from this tag...
            var serverId = 0;
            $.each(appVars.serverTags, function(index) {
                if (appVars.serverTags[index].id == widgetData.config.serverTagId) {
                    if (appVars.serverTags[index].servers.length > 0) {
                        serverId = appVars.serverTags[index].servers[0];
                    }
                }
            });
            widgetData.config.serverId = serverId;
            widgetData.config.metric = $("#widget_settings_sys_metric").val();
            displaySystemWidget(widgetData, true);
            break;
    }
    
}
function hideSettings() {
    $(".widget-settings").hide();
    $(".widget-settings-background").hide();
}

function displayOverlay(id, display) {
    if (display) {
        $("#widget_" + id + " .overlay").show();
    } else {
        $("#widget_" + id + " .overlay").hide();
    }
}

function displayApplicationWidget(widget, initial) {
    displayOverlay(widget.id, true);
    
    var colors = ["#0cf", "#f00", "#008000", "#c0c0c0"],
        currentNumber = $("#widget_" + widget.id + " .chart-container .value"),
        num = initial ? widget.displayDataPoints : 1;
    
    $("#widget_" + widget.id + " .title").html(widget.title);
    $("#widget_" + widget.id + " .value").empty();
    $("#widget_" + widget.id + "_chart").empty();
    
    $.ajax({
        type: "GET",
        url: "/api/application/metrics/data/",
        data: {
            "application": widget.config.application,
            "metric": widget.config.metric,
            "num": num,
            "grain": widget.config.grain,
            "tick_agg": widget.config.tick_agg,
            "hwb": widget.config.hwb
        },
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
    
            var date = new Date();
            $("#widget_" + widget.id + " .time-stamp").html(date.toUTCString());
            
            var fullMetric = "sys.app." + widget.config.application + "." + widget.config.metric;
            
            if (num == 1) {
                // First, lets make sure the time is greater than the last data point...
                var lastTime = widget.dataPoints[0][widget.dataPoints[0].length-1].time;
                var newTime = json_data.data[fullMetric][0].time;
                if (newTime > lastTime) {
                    if (widget.dataPoints[0].length >= widget.displayDataPoints) {
                        var firstElement = widget.dataPoints[0].shift(); 
                    }
                    widget.dataPoints[0].push(json_data.data[fullMetric][0]);
                    
                    $("#widget_" + widget.id + " .info").html("New data");
                } else {
                    $("#widget_" + widget.id + " .info").html("No new data!");
                }
            } else {
                $("#widget_" + widget.id + " .info").html("Initial data");
                // Create initial data points array...
                widget.dataPoints[0] = json_data.data["sys.app." + widget.config.application + "." + widget.config.metric];
                widget.dataPoints[1] = [];
                widget.dataPoints[2] = [];
                widget.dataPoints[3] = [];
            }
            
            // Build dataPoints array that the graph can understand...
            var dataPoints = [];
            var from = 0;
            var to = 0;
            try {
                for (var i=0; i < widget.dataPoints.length; i++) {
                    var tmpArray = [];
                    for (var j = 0; j < widget.dataPoints[i].length; j++) {
                        // Get from time (first element)...
                        if (i == 0 && j == 0) {
                            from = widget.dataPoints[i][j].time * 1000;
                        }
                    
                        // Get to time (last element)...
                        if (i == 0 && j == widget.dataPoints[i].length - 1) {
                            to = widget.dataPoints[i][j].time * 1000;
                        }
                        value = widget.dataPoints[i][j].value;
                        if (value < 0) value = 0;
                        tmpArray[j] = value;
                    }
                    dataPoints[i] = tmpArray;
                }

                $("#widget_" + widget.id + " .time-scale").html(getLabel("time_scale", widget.config.grain));
                $("#widget_" + widget.id + " .value").html(advAddFormatter(widget.config.numberFormat, prettifyNum(dataPoints[0][dataPoints[0].length-1] || "0")));
                Raphael("widget_" + widget.id + "_chart").barChart(from, to, dataPoints, colors, currentNumber, widget.config.numberFormat, widget.config.hwb);
            } catch(err) {
                $("#widget_" + widget.id + " .info").html(err.message);
            }
            displayOverlay(widget.id, false);
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
       	    var date = new Date();
            $("#widget_" + widget.id + " .time-stamp").html(date.toUTCString());
       	    $("#widget_" + widget.id + " .info").html("Error getting data!");
       	    
       	    displayOverlay(widget.id, false);
       	}
    });
}

function displayBusinessWidget(widget, initial) {
    displayOverlay(widget.id, true);
    
    var colors = ["#0cf", "#f00", "#008000", "#c0c0c0"],
        currentNumber = $("#widget_" + widget.id + " .chart-container .value"),
        metricValue = widget.config.metric + ".value",
        metricUpper = widget.config.metric + ".upper",
        metricLower = widget.config.metric + ".lower",
        num = initial ? widget.displayDataPoints : 1;
    
    $("#widget_" + widget.id + " .title").html(widget.title);
    $("#widget_" + widget.id + " .value").empty();
    $("#widget_" + widget.id + "_chart").empty();
    
    $.ajax({
        type: "GET",
        url: "/api/business/metrics/data/",
        data: {
            "metric": widget.config.metric,
            "num": num,
            "grain": widget.config.grain,
            "tick_agg": widget.config.tick_agg,
            "hwb": widget.config.hwb
        },
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
    
            var date = new Date();
            $("#widget_" + widget.id + " .time-stamp").html(date.toUTCString());
            
            if (num == 1) {
                try {
                    // First, lets make sure the time is greater than the last data point...
                    var lastTime = widget.dataPoints[0][widget.dataPoints[0].length-1].time;
                    var newTime = json_data.data[metricValue][0].time;
                    if (newTime > lastTime) {
                        for (var i=0; i < widget.dataPoints.length; i++) {
                            if (widget.dataPoints[i].length >= widget.displayDataPoints) {
                                // Remove first element in array...
                                var firstElement = widget.dataPoints[i].shift();
                            }
                        
                            // Add new data to the end of the array...
                            switch (i) {
                                case 0:
                                    if (json_data.data[metricValue]) widget.dataPoints[i].push(json_data.data[metricValue][0]);
                                    break;
                            
                                case 1:
                                    if (json_data.data[metricUpper]) widget.dataPoints[i].push(json_data.data[metricUpper][0]);
                                    break;
                            
                                case 2:
                                    if (json_data.data[metricLower]) widget.dataPoints[i].push(json_data.data[metricLower][0]);
                                    break;
                            }
                        }
                    
                        $("#widget_" + widget.id + " .info").html("New data");
                    } else {
                        $("#widget_" + widget.id + " .info").html("No new data!");
                    }
                } catch(err) {
                    $("#widget_" + widget.id + " .info").html(err.message);
                }
            } else {
                $("#widget_" + widget.id + " .info").html("Initial data");
                // Create initial data points array...
                widget.dataPoints[0] = [];
                widget.dataPoints[1] = [];
                widget.dataPoints[2] = [];
                widget.dataPoints[3] = [];
                
                if (json_data.data[metricValue])  widget.dataPoints[0] = json_data.data[metricValue];
                if (json_data.data[metricUpper])  widget.dataPoints[1] = json_data.data[metricUpper];
                if (json_data.data[metricLower])  widget.dataPoints[2] = json_data.data[metricLower];
            }
            
            // Build dataPoints array that the graph can understand...
            var dataPoints = [];
            var from = 0;
            var to = 0;
            try {
                for (var i=0; i < widget.dataPoints.length; i++) {
                    var tmpArray = [];
                    for (var j = 0; j < widget.dataPoints[i].length; j++) {
                        // Get from time (first element)...
                        if (i == 0 && j == 0) {
                            from = widget.dataPoints[i][j].time * 1000;
                        }
                    
                        // Get to time (last element)...
                        if (i == 0 && j == widget.dataPoints[i].length - 1) {
                            to = widget.dataPoints[i][j].time * 1000;
                        }
                        value = widget.dataPoints[i][j].value;
                        if (value < 0) value = 0;
                        tmpArray[j] = value;
                    }
                    dataPoints[i] = tmpArray;
                }
                
                $("#widget_" + widget.id + " .time-scale").html(getLabel("time_scale", widget.config.grain));
                $("#widget_" + widget.id + " .value").html(advAddFormatter(widget.config.numberFormat, prettifyNum(dataPoints[0][dataPoints[0].length-1] || "0")));
                Raphael("widget_" + widget.id + "_chart").barChart(from, to, dataPoints, colors, currentNumber, widget.config.numberFormat, widget.config.hwb);
            
            } catch(err) {
                $("#widget_" + widget.id + " .info").html(err.message);
            }
            
            displayOverlay(widget.id, false);
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
       	    var date = new Date();
            $("#widget_" + widget.id + " .time-stamp").html(date.toUTCString());
       	    $("#widget_" + widget.id + " .info").html("Error getting data!");
       	    
       	    displayOverlay(widget.id, false);
       	}
    });
}

function displaySystemWidget(widget, initial) {
    displayOverlay(widget.id, true);
    
    var date = new Date();
    
    $("#widget_" + widget.id + " .time-stamp").html(date.toUTCString());      
    $("#widget_" + widget.id + " .title").html(widget.title);
    $("#widget_" + widget.id + "_metric").html(getMetricName(widget.config.metric));
    
    $.ajax({
        type: "GET",
        url: "/api/system/data/",
        data: {
            "metric": widget.config.metric,
            "server_tag_id": widget.config.serverTagId,
            "server_id": widget.config.serverId
        },
        dataType: "json",
       	success: function(data) {
       	    var json_data = eval(data);
       	    
       	    if (json_data["summary"][0].servers.length > 0) {
                var systemChartData = createSystemChartData(widget, json_data),
                    widgetIndex = $("#widget_" + widget.id).data("widget-index");
                
                $("#widget_" + widget.id + " .value").html(advAddFormatter("percentage", prettifyNum(systemChartData.donutChartData[widget.config.metric].value)));
                $("#widget_" + widget.id + "_servers").html("Servers (" + systemChartData.serverIndex + " of " + systemChartData.serverCount + ")");
                $("#widget_" + widget.id + "_complex_label").html(systemChartData.server.hostname);
            
                // Render Heatmap chart...
                $("#widget_" + widget.id + "_heatmap_chart").empty();
           	    try {
                    Raphael("widget_" + widget.id + "_heatmap_chart").heatmapChart(widget, systemChartData.heatmapDataPoints);
                } catch(err) {
                    $("#widget_" + widget.id + "_heatmap_chart").html(err.message);
                }
            
                // Render donut chart...
                for (var i=0; i < systemChartData.donutDataPoints.length; i++) {
                    $("#widget_" + widget.id + "_" + i + "_donut_chart").empty();
                    $("#widget_" + widget.id + "_" + i + "_donut_chart").attr("title", systemChartData.donutDataPoints[i].title);
                    $("#widget_" + widget.id + "_" + i + "_donut_chart").data("serverid", systemChartData.donutChartData[systemChartData.donutDataPoints[i].metric_name].serverId);
                    try {
            		    Raphael("widget_" + widget.id + "_" + i + "_donut_chart").donutChart(systemChartData.donutDataPoints[i].value, systemChartData.donutDataPoints[i].color, {cx: 40, cy: 38, r: 30, rin: 20, label: true, selected: systemChartData.donutDataPoints[i].selected });
            		} catch(err) {
            		    $("#widget_" + widget.id + "_" + i + "_donut_chart").html(err.message);
            		}
            	}

            	// Render server chart...
            	$("#widget_" + widget.id + "_complex_chart").empty();
            	try {
        	    
            	    if (widget.config.metric == "diskp") {
            	        // Create donut containers...
            	        var maxVolumes = 5;
            	        for (var i=0; i < systemChartData.complexDataPoints.length; i++) {
            	            if (i < maxVolumes) {
            	                var html = "<div id='widget_" + widget.id + "_" + i + "_complex_chart_donut' class='donut-container";
                	            if (i==0) html += " first";
                	            html += "'";
                	            html += " title='" +  systemChartData.complexDataPoints[i].value + "%&nbsp;used\r\n" + (systemChartData.complexDataPoints[i].free/1000).toFixed(2) + "GB&nbsp;free'>";
                	            html += "</div>"; 
                	            $("#widget_" + widget.id + "_complex_chart").append(html);
        	                }
            	        }
        	        
            	        // Create donut labels...
            	        for (var i=0; i < systemChartData.complexDataPoints.length; i++) {
            	            if (i < maxVolumes) {
            	                var html = "<div class='donut-label";
                	            if (i==0) html += " first";
                	            html += "'>" + systemChartData.complexDataPoints[i].name + "</div>"; 
                	            $("#widget_" + widget.id + "_complex_chart").append(html);
                	        }
            	        }
        	        
            	        // Render graph...
            	        for (var i=0; i < systemChartData.complexDataPoints.length; i++) {
            	            if (i < maxVolumes) {
            	                var chartColor = (systemChartData.complexDataPoints[i].value > appVars.thresholds.disk) ? appVars.colors.red : appVars.colors.blue;
                                Raphael("widget_" + widget.id + "_" + i + "_complex_chart_donut").donutChart(systemChartData.complexDataPoints[i].value, chartColor, {cx: 22, cy: 22, r: 22, rin: 0, label: false	});
                            }
                        }
                	} else {
                	    var chartColor = appVars.colors.blue;
                        Raphael("widget_" + widget.id + "_complex_chart").lineChart(systemChartData.complexDataPoints.from, systemChartData.complexDataPoints.to, systemChartData.complexDataPoints.x, systemChartData.complexDataPoints.y, {x: 35, y: 16, w: 260, h: 64, title: systemChartData.server.hostname, config: {size:"large", shade:true, colors:[chartColor], nostroke: true, gutter: .01}});
                	}
                } catch(err) {
                    $("#widget_" + widget.id + "_complex_chart").html(err.message);
                }
            }
            displayOverlay(widget.id, false);
       	},
       	error: function(jqXHR, textStatus, errorThrown) {
       	    var date = new Date();
            $("#widget_" + widget.id + " .time-stamp").html(date.toUTCString());
       	    //$("#widget_" + widget.id + " .info").html("Error getting data!");
       	    
       	    displayOverlay(widget.id, false);
       	}
    });
}

function getMetricName(metric) {
    switch (metric) {
        case "cpu": return "CPU";
        case "mem": return "MEMORY";
        case "disk_busy": return "DISK BUSY";
        case "diskp": return "DISK";
    }
}

function createSystemChartData(widget, json_data) {
    var dataPoints = json_data.metrics[0].datapoints;
    var servers = json_data.summary[0]["servers"];
    var metrics = json_data.summary[0]["metrics"];
    var serverValues = json_data.summary[0]["metrics"][widget.config.metric].datapoints;
    var donutChartData = createSystemDonutChartData(metrics);
    
    serverValues.sort(sortByValues);
    
    var serverIndex = 0;
    for (var i=0; i < serverValues.length; i++) {
        serverIndex++;
        if (serverValues[i].server_id == widget.config.serverId) {
            break;
        }
    }
    
    var returnData = {
        server: getServerData(widget.config.serverId),
        serverIndex: serverIndex,
        serverCount: serverValues.length,
        donutChartData: donutChartData,
        heatmapDataPoints: createSystemHeatMap(serverValues, servers, widget.config.serverId, widget.config.metric),
        donutDataPoints: createSystemDonutChart(donutChartData, widget.config.metric),
        complexDataPoints: (widget.config.metric=="diskp") ? dataPoints : createSystemLineDataPoints(dataPoints)
    }

    return returnData;
}

function sortByValues(a, b)
{
  if (a.value > b.value) return -1;
  if (a.value < b.value) return 1;
  return 0;
}

function createSystemLineDataPoints(dataPoints) {
    var from = 0,
        to = 0,
        x = [],
        y = [];
        
    for (var i=0; i < dataPoints.length; i++) {
        if (i == 0) {
            from = dataPoints[i][1] * 1000;
        }
        if (i == dataPoints.length - 1) {
            to = dataPoints[i][1]  * 1000;
        }
        
        x.push(i);
        y.push(dataPoints[i][0]);
    }
    
    return {
        from: from,
        to: to,
        x: x,
        y: y
    }
}


function createSystemHeatMap(serverValues, servers, currentServerId, currentMetric) {
	var rows = 5,
	    cols = 10,
	    width = 12,
	    gutter = 1,
	    groupCount = 1,
	    containerWidth = 70,
	    serverCount = servers.length,
		count = 0,
		arr = [],
		distance = 0,
		magic = (containerWidth/groupCount - (rows*width + (rows-1)*gutter))/3;
		
	for (k = 0; k < groupCount; k++) {
		distance = k*(containerWidth/groupCount + magic); 
		for (row = 0; row < rows; row++) {
			for (col = 0; col < cols; col++) {

				var color = '#fff', 
				    capacity = 0,
					serverId = '',
					serverName = '',
					selected = false,
					sv = serverValues[count],
					timeNow = new Date().getTime(),
					notStreaming = false;
					
				if (sv) {
    				try {
    				    var server = getServerData(sv.server_id);
    				    serverId = server.id;
    				    serverName = server.hostname;
    				    serverTime = sv.time;
    				    serverValue = sv.value;
				    
    				    timeDifference = (timeNow - (serverTime * 1000)) / 1000;
                        if (timeDifference > 180) {
                            notStreaming = true;
                        }
                    
    				    if (serverId == currentServerId) selected = true;
            	    
    					switch (currentMetric) {
    						case 'cpu':
    							capacity =  sv.value;
    							color = capacity > appVars.thresholds.cpu ? appVars.colors.red : appVars.colors.blue;
    							break;

    						case 'mem':
    							capacity =  sv.value;
    							color = capacity > appVars.thresholds.memory ? appVars.colors.red : appVars.colors.blue;
    							break;

    						case 'diskbusy_max':
    							capacity =  sv.value;
    							color = capacity > appVars.thresholds.disk_busy ? appVars.colors.red : appVars.colors.blue;
    							break;

    						case 'diskp':
    							capacity =  sv.value;
    							color = capacity > appVars.thresholds.disk ? appVars.colors.red : appVars.colors.blue;
    							break;

    					}
					
    					if (notStreaming) {
    					    color = appVars.colors.grey;
    					}
    				} catch(ex){}
    			}
				
                arr.push({
                    x: col*(width + gutter) + distance, 
                    y: row*(width + gutter), 
                    width: width, 
                    height: width, 
					color: color,
					server_id: serverId,
					server_name: serverName,
					server_time: serverTime,
					server_value: serverValue,
					selected:  selected,
					capacity: capacity
				});

				count++;
			}
		}
	}

	return arr;
}

function createSystemDonutChartData(metricData) {
    var chartData = [];
    for (metricIndex = 0; metricIndex < 4; metricIndex++) { 
        var metric = "";
        switch (metricIndex) {
            case 0: metric = "cpu"; break;
            case 1: metric = "mem"; break;
            case 2: metric = "diskbusy_max"; break;
            case 3: metric = "diskp"; break;
        }
        
        chartData[metric] = {
            serverId: metricData[metric].datapoints[0].server_id,
            value: metricData[metric].datapoints[0].value,
            time: metricData[metric].datapoints[0].time,
            server: getServerData(metricData[metric].datapoints[0].server_id)
        };
        
        for (i = 0; i < metricData[metric].datapoints.length; i++) {
            if (metricData[metric].datapoints[i].value > chartData[metric].value) {
                chartData[metric].serverId = metricData[metric].datapoints[i].server_id;
                chartData[metric].value = metricData[metric].datapoints[i].value;
                chartData[metric].time = metricData[metric].datapoints[i].time;
                chartData[metric].server = getServerData(metricData[metric].datapoints[i].server_id);
            }
        }
    }
	
	return chartData;
}

function createSystemDonutChart(chartData, currentMetric) {
    var donut_chart = [
		{name: 'CPU', metric_name: "cpu", value: chartData["cpu"].value, color: chartData["cpu"].value > appVars.thresholds.cpu ? appVars.colors.red : appVars.colors.blue,
		  selected: (currentMetric=='cpu')?true : false, data_id: chartData["cpu"].serverId, time: chartData["cpu"].time, title: chartData["cpu"].server.hostname },
		  
		{name: 'MEMORY', metric_name: "mem", value: chartData["mem"].value, color: chartData["mem"].value > appVars.thresholds.memory ? appVars.colors.red : appVars.colors.blue,
		  selected: currentMetric=='mem'?true : false, data_id: chartData["mem"].serverId, time: chartData["mem"].time, title: chartData["mem"].server.hostname  },
		  
		{name: 'DISK BUSY', metric_name: "diskbusy_max", value: chartData["diskbusy_max"].value, color: chartData["diskbusy_max"].value > appVars.thresholds.disk_busy ? appVars.colors.red : appVars.colors.blue,
		  selected: currentMetric=='diskbusy_max'?true : false, data_id:chartData["diskbusy_max"].serverId, time: chartData["diskbusy_max"].time, title: chartData["diskbusy_max"].server.hostname  },
		  
		{name: 'DISK', metric_name: "diskp", value: chartData["diskp"].value, color: chartData["diskp"].value > appVars.thresholds.disk ? appVars.colors.red : appVars.colors.blue,
		  selected: currentMetric=='diskp'?true : false, data_id: chartData["diskp"].serverId, time: chartData["diskp"].time, title: chartData["diskp"].server.hostname  }
	]
	
	return donut_chart;
}

function getServerData(serverId) {
    var server = {};
    for (i = 0; i < appVars.servers.length; i++) {
        if (appVars.servers[i].id == serverId) {
            server = appVars.servers[i];
            break;
        }
    }
    
    return server;
}