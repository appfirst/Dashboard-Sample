
Raphael.g.colors = ['#0cf', '#f90', '#f09'];

Raphael.fn.barChart = function (start, end, values, colors, currNumber, numberFormat, hwb) {
	var opts = {x: 0, y: -5, w: 208, h: 95, config: {gutter: '15%', vgutter: 22} },
		paper = this,
		chart = this.set(),
		x = opts.x,
		y = opts.y,
		width = opts.w,
		height = opts.h,
		config = opts.config,
		axisFont = '11px "minion-pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
		fin = function () {
		    this.flag = paper.popup(this.bar.x, this.bar.y, toTime(this.bar.time) + "\n" + 
		        advAddFormatter(numberFormat, prettifyNum(this.bar.value || "0"))
		        ,this.bar.x > 160 ? 'left' : 'right', 5).insertBefore(this);
	        },
	    fout = function () {
		    this.flag.animate({opacity: 0}, 300, function () {this.remove();});
	        };

	config.colors = colors;
	config.start = start;
	config.time_scale = (end - start) / (values[0] ? values[0].length - 1 : 1);
	config.curr_number = currNumber;
	config.hwb = hwb;

	paper.customBarchart(x, y, width, height, values, config).hover(fin, fout);

	paper.text(x, height - 21, toTime(start)).attr({
		font: axisFont,
		"text-anchor": "start",
		fill: appVars.colors.grey
	});

	paper.text(width, height - 21, toTime(end)).attr({
		font: axisFont, 
		"text-anchor": "end",
		fill: appVars.colors.grey
	});

	return chart;
};

Raphael.fn.lineChart = function (start, end, valuesx, valuesy, opts) {
  
	var opts = opts || {x: 0, y: 0, w: 142, h: 34, config: {size: 'large', shade:true, colors: appVars.color.blue, nostroke: true, gutter: .01}},
		paper = this,
		chart = this.set(),
		x = opts.x,
		y = opts.y,
		width = opts.w,
		height = opts.h;
		config = opts.config,
		axisFont = '11px "minion-pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
		axisColor = appVars.colors.grey,
		maxY = _.max(valuesy);

  if(maxY == 0) maxY = 100;
  
	paper.linechart(x, y, width, height, valuesx, valuesy, config).hoverColumn(function(){
		this.flag = paper.popup(this.x, this.y, toTime(start + (this.axis+1)*60000) + "\n" + this.values[0] + "%", this.x > 160 ? 'left' : 'right', 2).insertBefore(this);
		}, function(){ this.flag.animate({opacity: 0}, 300, function () {this.remove();});}
	);

	if (config.size == 'large')
	{
		paper.text(x, height + 21 , toTime24(start)).attr({
			font: axisFont,
			"text-anchor": "start",
			fill: axisColor
		});

		paper.text(width + x, height + 21, toTime24(end)).attr({
			font: axisFont,
			"text-anchor": "end",
			fill: axisColor
		});

		//draw y-axis
		paper.text(x - 5, 15, prettifyNum(maxY) + "%").attr({
			font: axisFont,
			"text-anchor": "end",
			fill: axisColor
		});
		
		paper.text(x - 5, height + 14, "0%").attr({
			font: axisFont,
			"text-anchor": "end",
			fill: axisColor
		});
		
		//hardcoded y-axis line
		paper.path(["M35.51,79.99", "L35.51,16.01", "M32.01,79.49", "L36.01,79.49", "M32.01,16.51", "L36.01,16.51"].join("")).attr({
		  stroke: "#bbb"
		});
	}
	return chart;
};

Raphael.fn.donutChart = function (value, color, opts) {

	var opts = opts || {cx: 40, cy: 38, r: 30, rin: 20, label: true, selected: false },
		paper = this,
		rad = Math.PI / 180,
		chart = this.set(),
		cx = opts.cx,
		cy = opts.cy,
		r = opts.r,
		rin = opts.rin,
		org_value = value;

	if(value >= 100) value = 100;

	if(opts.selected){
		paper.circle(cx, cy, r + 2).attr({
			'stroke': appVars.colors.grey_darker,
			'fill': '#fff',
			'stroke-width':0.5
		});
	}

	if(opts.label){
		paper.circle(cx, cy, r + 1).attr({
			'fill': '#fff',
			'stroke': '#ddd',
			'stroke-width':0,
			'stroke-opacity':0
		});

		paper.text(cx, cy, org_value + '%').attr({
			font: '11px "myriad-pro-condensed", "Helvetica Neue", Helvetica, Arial, sans-serif', 
			fill: color,
			'font-weight': 600
		});
	}

	function sector(cx, cy, r, r2, startAngle, endAngle, params) {

		var x1 = cx + r * Math.cos(-startAngle * rad),
			x2 = cx + r * Math.cos(-endAngle * rad),
			y1 = cy + r * Math.sin(-startAngle * rad),
			y2 = cy + r * Math.sin(-endAngle * rad),
			xx1 = cx + r2 * Math.cos(-startAngle * rad),
			xx2 = cx + r2 * Math.cos(-endAngle * rad),
			yy1 = cy + r2 * Math.sin(-startAngle * rad),
			yy2 = cy + r2 * Math.sin(-endAngle * rad);

		return paper.path(["M", xx1, yy1,
			"L", x1, y1,
			"A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2,
			"L", xx2, yy2,
			"A", rin, rin, 0, +(endAngle - startAngle > 180), 1, xx1, yy1, "z"]
			).attr(params);
	}

	var angle = 90,
		total = 100.01,
		start = 0,
		values = [total - value, value],
		colors = ['#fff', color],
		process = function (j) {

			var value = values[j],
				angleplus = 360 * value / total,
				color = colors[j],
				p = sector(cx, cy, r, rin, angle, angle + angleplus, {fill: color, "stroke-width": 0,'stroke-opacity':0});

				angle += angleplus;
				chart.push(p);
				start += .1;
			};

			for (i = 0; i < values.length; i++) {
				process(i);
		}

	return chart;
};

Raphael.fn.heatmapChart = function (widget, values) {

	var paper = this,
		chart = this.set();

	function square(x, y, width, height, params) {
		return paper.rect(x, y, width, height).attr(params);
	}

	var process = function (j) {
		var value = values[j],
			params = { fill: value.color, "stroke-width": 0, 'stroke-opacity':0 };

		if(value.selected){
		  params["stroke-width"] = 0.5;
		  params["stroke-opacity"] = 0.5;
		  params["stroke"] = appVars.colors.grey_darker;
		  value.x += 0.5;
		  value.y += 0.5;
		  value.width -= 0.5;
		  value.height -= 0.5;
		}
		
		//+15px as top padding
		value.y += 15;
		
		if(value.color != '#fff') params["fill"] = value.color;
		    
		var p = square(value.x, value.y, value.width, value.height, params).click(function(e) { 
		    widget.config.serverId = value.server_id;
		    displaySystemWidget(widget, true);
		});

		p.node.setAttribute("class","hm-server");
		p.node.setAttribute("data-serverid",value.server_id);
		
		if(value.server_name){
			p.hover(  function () {
				var dir = 'right', 
				    x1 = 0, 
				    y1 = 0, 
				    arr = _.last(value.server_name.split('-')).split("");

				for(var i = arr.length/12; i > 1; i--){ //add line break
					arr.splice(12*i, 0, '\n');
				}

				if (j % 10 >= 7){
					dir = "left";
					x1 = 0;
					y1 = 6;
				}else if (j % 10 <= 3) {
					dir = "right";
					x1 = 12;
					y1 = 6;
				}else{
					if(j > 9){
						dir = "up";
						x1 = 6;
						y1 = 0;
					}else{
						dir = "down";
						x1 = 6;
						y1 = 12;
					}
				}

				this.flag = paper.popup(value.x + x1, value.y + y1, arr.join("") + ": " + value.capacity + "%", dir, 2).insertBefore(this);
				this.flag.toFront();
			},
			fout = function () {
				this.flag.animate({opacity: 0}, 300, function () {this.remove();});
			}); 
		}
		chart.push(p);
	};

	for (i = 0; i < values.length; i++) {
		process(i);
	}
	return chart;
};
