var MAX_STATUS_LENGTH = 15;

function genChartId(){
  return "holder-" + parseInt(new Date().getTime() * Math.random() + Math.random()*100/Math.random());
}

function toTime(num){
	return new Date(num).format('m/dd h:MM TT');
}

function toTime24(num){
	return new Date(num).format('m/dd HH:MM');
}

function toPercentage(num, total){
  return parseFloat((num*100/total).toFixed(1));
}


function isSelected(val1, val2){
	return val1 == val2  ? "selected" : "" 
};

function isChecked(val1, val2){
	return val1 == val2  ? "checked" : "" 
};

function isArray(v) {
    return Object.prototype.toString.call(v) === '[object Array]';
}

function addStatusMessage(status) {
    var ret = "";
    if (!status) {
        return ret;
    }
    if (status.length == 0) {
        return ret;
    }
    ret = "\n";

    // Due to limited real estate we can only show one status message
    if (status[0].length > MAX_STATUS_LENGTH) {
        ret = ret + status[0].substring(0, MAX_STATUS_LENGTH)+ "..";
    } else {
        ret = ret + status[0];
    }
    return ret;
}

function displayStatusMessage(widgetId, title, status) {
    if (!status) {
        return;
    }
    if (status.length == 0) {
        return;
    }
    
    var message = "";
    if (_.isArray(status)) {
        for (i in status) {
            message += "<br/>" + status[i];
        }
    } else {
        message = status;
    }
    
    $(".status-message-title").html(title);
    $(".status-message-content").html(message);
    
    var windowWidth = $(window).width(); 
    var windowHeight = $(window).height(); 
    var windowScrollTop = $(window).scrollTop(); 
    
    var viewport = $("#viewport");
    var viewportPosition = viewport.position();
    var viewportLeft = parseInt($("#viewport").css("margin-left").replace("px", ""));
    var viewportTop = viewportPosition.top;    //parseInt($("#viewport").css("top").replace("px", ""));
    
    var widgetContainer = $("#wid-" + widgetId);
    var widgetWidth = $("#wid-" + widgetId).width();
    var widgetPosition = widgetContainer.position();

    var messageWidth = $(".status-message-container").width();
    var messageHeight = $(".status-message-container").height();

    var left = viewportLeft + widgetPosition.left + widgetWidth + 15;
    if ((left + messageWidth) > windowWidth) {
        left = widgetPosition.left - messageWidth;
    } 
    
    var top = viewportTop + widgetPosition.top;
    if ((top + messageHeight) > windowHeight) {
        top = windowHeight - messageHeight - 5;
    }
    if (top < windowScrollTop) top = windowScrollTop + 5;
    
    $(".status-message-container").css("left", left + "px");
    $(".status-message-container").css("top", top + "px");
    $(".status-message-container").show();
}

function hideStatusMessage() {
    $(".status-message-container").hide();
}

function addCommas(nStr){
	if(isNaN(nStr)){
		return "-";
	}else {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}

		return x1 + x2;
  	}
};

function advAddFormatter(format, value) {
    if (format == "currency") {
        return "$" + numberFormatter(value);
    } else if (format == "percentage") {
        return addCommas(value) + "%";
    } else if (format == "bytes") {
        return nFormatter(value) + "B";
    } else if (format == "microseconds") {
        if (value > 1000000)
            return (value/1000000).toFixed(1) + "s";
        if (value > 1000) 
            return (value/1000).toFixed(1) + "ms";
        return value + "us";
    } else {
        return numberFormatter(value); 
    }
}

function addFormatter(format, nStr){
    if (format == "currency") {
        return "$" + nStr;
    } else if (format == "percentage") {
        return nStr + "%";
    } else if (format == "bytes") {
        return nStr + "B";
    } else if (format == "microseconds") {
        return nStr + "ms";
    } else if (format == "perminute") {
        return nStr + "pm"; 
    } else {
        return nStr;
    }
}

function prettifyNum(num){
  try{
    return parseFloat((num).toFixed(1));
  }catch(ex){
    return 0;
  }
}

function numberFormatter(num) {
    if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(1) + 'T';
    }
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    return addCommas(num);
}

function nFormatter(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'G';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

function average (arr)
{
	return _.reduce(arr, function(memo, num)
	{
		return memo + num;
	}, 0) / arr.length;
}

function getRepString (rep) {
	rep = rep+''; // coerce to string
	if (rep < 1000) {
		return rep; // return the same number
	} else if (rep < 10000) { // place a comma between
		return rep.charAt(0) + ',' + rep.substring(1);
	} else { // divide and format
		return (rep/1000).toFixed(rep % 1000 != 0)+'k';
	}
}

function lineBreak(text){
  return text.replace(/[\r\n]{1}/g, " <br/> ").replace(/href=/g, "target='_blank' href=")
    .replace(/(http?:\/\/\S*)/g, '<a href="$1" target="_blank">$1</a>');
}

function trackMetric(msg)
{
  if(App.vars.tracking){
    //db.log(msg.msg);
    $.ajax({
  		url:statsdUrl, 
  		dataType: 'jsonp',
  		data:  msg, 
  		success: function(data) {}
  	});
  }
	
}

function getGrainTimerInterval(grain) {
    switch (grain) {
		case "1min":
			return 1*60000;
			break;
        case "3min":
            return 3*60000;
            break;
        case "5min":
            return 5*60000;
            break;
		case "10min":
			return 10*60000;
			break;
		case "15min":
			return 15*60000;
			break;
		case "20min":
			return 20*60000;
			break;
		case "25min":
			return 25*60000;
			break;
		case "30min":
			return 30*60000;
			break;
		case "35min":
			return 35*60000;
			break;
		case "40min":
			return 40*60000;
			break;
		case "45min":
			return 45*60000;
			break;
  		case "50min":
			return 50*60000;
			break;
		case "55min":
			return 55*60000;
			break;
		case "1hour":
			return 60*60000;
			break;
		case "1day":
			return 24*60*60000;
			break;
		default:
			return 1*60000;
	}
}

function getLabel(type, value){
	return {
			time_scale: {
			"1min": "1 Minute",
            "3min": "3 Minutes",
            "5min": "5 Minutes",
			"10min": "10 Minutes",
			"15min": "15 Minutes",
			"20min": "20 Minutes",
			"25min": "25 Minutes",
			"30min": "30 Minutes",
			"35min": "35 Minutes",
			"40min": "40 Minutes",
			"45min": "45 Minutes",
			"50min": "50 Minutes",
			"55min": "55 Minutes",
			"1hour": "1 Hour",
			"1day": "1 Day"
		},

		hwb: {
			"1": "ON",
			"0": "OFF"
		},
		
		server_metric: {
			"cpu": "CPU",
			"memory": "Memory",
			"disk_busy": "Disk Busy",
			"disk": "Disk Used"
		}

	}[type][value];

}

function getTimerInterval(grain){
	return {
			"1min": 1,
            "3min": 3,
            "5min": 5,
			"10min": 10,
			"15min": 15,
			"20min": 20,
			"25min": 25,
			"30min": 30,
			"35min": 35,
			"40min": 40,
			"45min": 45,
			"50min": 50,
			"55min": 55,
			"1hour": 60,
			"1day": 1440
		}[grain];

}