/*!
* g.Raphael 0.5 - Charting library, based on Raphaël
*
* Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/
(function () {
	var mmin = Math.min,
	mmax = Math.max;

	function finger(x, y, width, height, dir,ending, isPath, paper) {
		var path,
			ends = { round: 'round', sharp: 'sharp', soft: 'soft', square: 'square' };

		// dir 0 for horizontal and 1 for vertical
		if ((dir && !height) || (!dir && !width)) {
			return isPath ? "" : paper.path();
		}

		ending = ends[ending] || "square";

		switch (ending) {
			case "square":
				if (!dir) {
					path = [
						"M", x, y + ~~(height / 2),
						"l", 0, -height, width, 0, 0, height,
						"z"
						];
				} else {
					path = [
						"M", x + ~~(width / 2), y,
						"l", 1 - width, 0, 0, -height, width - 1, 0,
						"z"
					];
				}
				break;
			case "soft":
		}

		if (isPath) {
			return path.join(",");
		} else {
			return paper.path(path);
		}
	}

	function pickColor(limit, top, colors, last, curr_number){
		var color = colors[0];

		if(limit){
		  if(limit.upper >= top && limit.lower <= top){
		    color = colors[0];
		  } else if(limit.lower <= top){
		    color = colors[2];
		  } else if(limit.upper >= top){
		    color = colors[1];
		  }
		}

		if(last){
		  if(curr_number) curr_number.css("color", color);
		}
		
		return color;
   }

   /*
    * Vertical Barchart
    * accept [values0, values1, values2, values3]: 0 will be current (bar chart), 1, 2 is holt winter bands
    * and 3 represents the statusMsg
    */
	function VBarchart(paper, x, y, width, height, values, opts) {
		opts = opts || {};

		var chartinst = this,
			type = "square",
			gutter = parseFloat(opts.gutter || "20%"),
			chart = paper.set(),
			bars = paper.set(),
			covers = paper.set(),
			covers2 = paper.set(),
			total = Math.max.apply(Math, values),
			colors = opts.colors || chartinst.colors,
			start = opts.start,
			time_scale = opts.time_scale,
			len = values.length-1;

		if (Raphael.is(values[0], "array")) {
			total = [];
			len = values[0].length;

			for (var i = values.length-1; i--;) {
				total.push(Math.max.apply(Math, values[i]));
			}

			total = Math.max.apply(Math, total);
		}

		var barwidth = width / (len * (100 + gutter) + gutter) * 100,
			barhgutter = barwidth * gutter / 100,
			barvgutter = opts.vgutter == null ? 20 : opts.vgutter,
			stack = [],
			X = x + barhgutter,
			Y = (height - 2 * barvgutter) / total,
			limits = [];

		X = x + barhgutter;
    
		if(values[1] && values[1].length > 0 && values[2] && values[2].length > 0){
      
			//upper  line
			var path = [], j = 1, begin = 0;

			for (var i = 0; i < len; i++) {
				var stack = [];

				X += barwidth;
        
				var h = Math.round(values[j][i] * Y), top = y + height - barvgutter - h;
				if (h==0) h=1;
				
				if (opts.hwb == "1") {
				    limits.push({upper: height - top});
				}
				
				if(i == 0){
					path.push("M" + ((X + barwidth / 2) - barwidth) + " " + top );
				}else{
					path.push("L" + ((X + barwidth / 2) - barwidth) + " " + top );
				}

				X += barhgutter;
			}
      
			//lower line
			j = 2;

			for (var i = len -1; i >= 0; i--) {
				var stack = [];

				X -= barhgutter;

				//draw sth here
				var h = Math.round(values[j][i] * Y), top = y + height - barvgutter - h;

                if (opts.hwb == "1") {
 				    limits[i].lower = height - top;
                }
            
				if(i == 0){
					path.push("L" + ((X + barwidth / 2) - barwidth ) + " " + top + "Z");
				}else{
					path.push("L" + ((X + barwidth / 2) - barwidth) + " " + top );
				}

				X -= barwidth;
			}
      
			if(Math.max.apply(Math, values[1]) > 0 && Math.max.apply(Math, values[2]) > 0 ){
				paper.path(path.join("")).attr({'stroke-opacity':0,'stroke-width': 0, fill: '#EBEBEB'});  
			}
		}

		//current

		X = x + barhgutter;

		j = 0;

		for (var i = 0; i < len; i++) {
			stack = [];

			var h = Math.round(values[j][i] * Y);
			
			if (h==0 || isNaN(h)) h=1;

			var	top = y + height - barvgutter - h,
				color = (h==1)?"#c0c0c0":pickColor(limits[i], height - top, colors, i == len - 1, opts.curr_number),
				bar = finger((X + barwidth / 2), top + h, barwidth, h, true, type, null, paper).attr({ 'stroke-opacity':0,'stroke-width':0,stroke: color, fill: color, 'fill-opacity': .85 });
                
				bars.push(bar);

				bar.y = top;
				bar.x = (X + barwidth / 2);
				bar.w = barwidth;
				bar.h = h;
				bar.value = values[j][i];
				bar.time = start + i*time_scale;
				X += barwidth + barhgutter;
                if (values[3] && values[3].length > 0) {
                    bar.status = values[3][i];
                } else {
                    bar.status = [];
                }
		}
		
		//hover effect
		X = x + barhgutter;
		
		j = 0;

		for (var i = 0; i < len; i++) {
			var cover;

			covers.push(cover = paper.rect(Math.round(X), y + barvgutter, barwidth, height - barvgutter).attr(chartinst.shim));
			cover.bar = bars[i];
        cover.value = cover.bar.value;
			X += barwidth + barhgutter;
		}

		chart.hover = function (fin, fout) {
			covers.show();
			covers.mouseover(fin).mouseout(fout);
			return this;
		};
    
    chart.push(bars, covers);
    chart.bars = bars;
    chart.covers = covers;
    return chart;
  };

  //inheritance
  var F = function() {};
  F.prototype = Raphael.g;
  VBarchart.prototype = new F;

  Raphael.fn.customBarchart = function(x, y, width, height, values, opts) {
     return new VBarchart(this, x, y, width, height, values, opts);
  };
})();
