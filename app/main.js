var margin = { top: 20, right: 20, bottom: 70, left: 40 },
    Bwidth = 600 - margin.left - margin.right,
    Bheight = 300 - margin.top - margin.bottom;

let Branges = [
    { label: "10-15", sub: [10, 15], count: 0 },
    { label: "16-21", sub: [16, 21], count: 0 },
    { label: "22-30", sub: [22, 30], count: 0 },
    { label: "31-40", sub: [31, 40], count: 0 },
    { label: "41-70", sub: [41, 70], count: 0 }
];

var x = d3.scale.ordinal().rangeRoundBands([0, Bwidth], .05);
var y = d3.scale.linear().range([Bheight, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(6);

var Bsvg = d3.select("#age_balance").append("svg")
    .attr("width", Bwidth + margin.left + margin.right)
    .attr("height", Bheight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.dsv(';')("datasets/mass-shootings-in-america.csv", function (error, data) {

    Branges = countBarOccurences(Branges, data);
    x.domain([10, 70]);
    y.domain([0, d3.max(data, function (d) { return d.Average_Shooter_Age; })]);

    Bsvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + Bheight + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)");

    Bsvg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value ($)");

    Bsvg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function (Branges) { return x(Branges.count); })
        .attr("width", x.rangeBand())
        .attr("y", function (Branges) { return y(Branges.count); })
        .attr("height", function (Branges) { return Bheight - y(Branges.count); });

});

let dWidth = 860;
let dHeight = 350;
let colors = ["#74D5DD", "#08B6CE", "#398AD7", "#2F66A9", "#00003B"];

let categories =[
	{ label: "Home and neighborhood", sub: ["Residential home/Neighborhood, Retail/Wholesale/Services facility", "Residential home/Neighborhood"], count: 0 },
	{ label: "School and educationnal", sub: ["Primary school", "Secondary school", "College/University/Adult education"], count: 0 },
	{ label: "Public facilities", sub: ["Medical/Care", "Public transportation", "Park/Wilderness", "Place of worship", "Restaurant/Cafe", "Retail/Wholesale/Services facility", "Entertainment Venue", "Street/Highway"], count: 0 },
	{ label: "Military facilities", sub: ["Government facility", "Military facility"], count: 0 },
	{ label: "Work place", sub: ["Company/Factory/Office"], count: 0 }
];

let categories2 = [
    { label: "Black", sub: ["Black American or African American"], count: 1 },
    { label: "White", sub: ["White American or European American"], count: 1 },
    { label: "Asian", sub: ["Asian American"], count: 1 },
    { label: "Other races", sub: ["Some other race","Unknown"], count: 1 }
];
class Donut {

	// Constructor

	constructor(width, height, svgID, tooltipClass) {
		
		this.width = width;
		this.height = height;
		this.radius = Math.min(width, height) / 2;
		this.svgID = svgID;
		this.tooltipID = tooltipClass;
		
		this.svg;
		this.tooltip;
		this.arc;
		this.outerArc;
		this.key;
		this.pie;

		this.init();
	}


	/**
	 * Setup components for the donut
	 */
	init() {
		// SVG
		this.svg = d3.select(this.svgID)
			.attr("width", this.width)
			.attr("height", this.height)
			.append("g")
			.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

		// GROUPS
		this.svg.append("g").attr("class", "slices");
		this.svg.append("g").attr("class", "labels");
		this.svg.append("g").attr("class", "lines");

		// TOOLTIP
		this.tooltip = d3.select("body")
			.append("div")
			.attr("id", this.tooltipID)
			.attr("class", "donutTooltip")
			.style("opacity", 0);
	}


	/**
	 * 
	 * @param {*} key 
	 * @param {*} data 
	 */
	change(color, data) {

		// LOCAL VALUES
		let radius = this.radius;
		let tooltip = this.tooltip;
		let percentage = this.getPercentage;

		// ARCS
		let arc = d3.svg.arc()
			.outerRadius(radius * 0.8)
			.innerRadius(0);

		let outerArc = d3.svg.arc()
			.innerRadius(radius * 0.9)
			.outerRadius(radius * 0.1);

		// KEY
		let key = function (d) {
			return d.data.label;
		}

		// PIE
		let pie = d3.layout.pie()
			.sort(null)
			.value(function (d) {
				return d.count;
			});

		/* ------- PIE SLICES -------*/
		let slice = this.svg.select(".slices").selectAll("path.slice")
			.data(pie(data), key);

		slice.enter()
			.insert("path")
			.style("fill", function (d) { return color(d.data.label); })
			.attr("class", "slice")

			// ON SLICE MOUSEOVER
			.on("mouseover", function (d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", 1);
				// SHOW PERCENTAGE
				let percentage = (d.endAngle - d.startAngle)/(2*Math.PI)*100; 
				tooltip.text(percentage + "%")
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})

			// ON SLICE MOUSEOUT
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", 0);
			});


		slice.transition().duration(1000)
			.attrTween("d", function (d) {
				this._current = this._current || d;
				let interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function (t) {
					return arc(interpolate(t));
				};
			})


		/* ------- TEXT LABELS -------*/

		let text = this.svg.select(".labels").selectAll("text")
			.data(pie(data), key);

		text.enter()
			.append("text")
			.attr("dy", ".35em")
			.text(function (d) {
				return d.data.label;
			});
			
		function midAngle(d) {
			return d.startAngle + (d.endAngle - d.startAngle) / 2;
		}

		text.transition().duration(1000)
			.attrTween("transform", function (d) {
				this._current = this._current || d;
				let interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function (t) {
					let d2 = interpolate(t);
					let pos = outerArc.centroid(d2);
					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
					return "translate(" + pos + ")";
				};
			})
			.styleTween("text-anchor", function (d) {
				this._current = this._current || d;
				let interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function (t) {
					let d2 = interpolate(t);
					return midAngle(d2) < Math.PI ? "start" : "end";
				};
			});

		text.exit()
			.remove();

		/* ------- SLICE TO TEXT POLYLINES -------*/

		let polyline = this.svg.select(".lines").selectAll("polyline")
			.data(pie(data), key);

		polyline.enter()
			.append("polyline");

		polyline.transition().duration(1000)
			.attrTween("points", function (d) {
				this._current = this._current || d;
				let interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function (t) {
					let d2 = interpolate(t);
					let pos = outerArc.centroid(d2);
					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
					return [arc.centroid(d2), outerArc.centroid(d2), pos];
				};
			});

		polyline.exit()
			.remove();
	}


/**
	 * Remove data element which have a count value equals to 0
	 * @param {*} data 
	 * @param {*} colors 
	 */
    format(data) {

		let local = JSON.parse(JSON.stringify(data));
		// REMOVE COUNTS VALUE EQUALS TO 0
		local.forEach(function (d) {
			if (d.count == 0) {
				local.splice(local.indexOf(d), 1);
			}
		});
		return local;
	}


/**
	 * Return the labels of the chart
*/
    getLabels(categories) {
		let labels = [];
		categories.forEach(function (c) {
			labels.push(c.label);
		})
		return labels;
	}


	/**
	 * Regroup data into a smaller number of categories
	 * @param {*} new_categories 
	 */
	reCategorize(categories, data) {

		let local = JSON.parse(JSON.stringify(data));
		let localCat = JSON.parse(JSON.stringify(categories));
		local.forEach(function (d) {
			let place = d.Place_Type;
			localCat.forEach(function (c) {
				if (c['sub'].includes(place)) {
					c['count'] += 1;
				}
			});
		});
		return localCat;
	}


	/**
	 * Count occurences in data
	 * @param {Array<JSON>} data 
	 */
	countOccurences(categories, data) {

		let local = JSON.parse(JSON.stringify(data));
		let localCat = JSON.parse(JSON.stringify(categories));
		local.forEach(function (d) {
			let place = d.Place_Type;
			localCat.forEach(function (c) {
				if (c['label'] == place) {
					c['count'] += 1;
				}
			});
		});
		return localCat;
	}


	/**
	 * 
	 * @param {*} scheme 
	 * @param {*} data 
	 */
	generateDonut(scheme, categories, data, doReduce = false) {

		// DONUT DATA
		let donutData = null;
		if (doReduce) {
			donutData = this.reCategorize(categories, data).sort(function (a, b) {
				return a.count - b.count;
			});
		} else {
			donutData = this.countOccurences(categories, data).sort(function (a, b) {
				return a.count - b.count;
			});
		}

		// FORMAT CHART ELEMENTS
		donutData = this.format(donutData, scheme);

		// LABELS
		let domain = this.getLabels(categories);

		// COLOR SCHEME
		let colors = d3.scale.ordinal()
			.domain(domain)
			.range(scheme);

		this.change(colors, donutData);
	}


	/**
	 * Clear and remove the chart
	 */
	clear() {
		// SVG
		this.svg.selectAll("g")
			.transition()
			.duration(100)
			.style("opacity", 0).remove();
		// TOOLTIP
		this.tooltip.transition()
			.duration(200)
			.style("opacity", 0).remove();
	}
}

// IMPORT DATA
d3.dsv(';')("datasets/mass-shootings-in-america.csv", function(data) {

	let donut = new Donut(dWidth, dHeight, "#donut", "donutTooltip");
	let donut2 = new Donut(dWidth, dHeight, "#donut", "donutTooltip");
	
	donut.generateDonut(colors, categories, data, true);
	donut2.generateDonut(colors, categories2, data, true);
	

});

//Width and height of map
var width = 600;
var height = 300;
var centered;

// Map's donut params
let dMapWidth = 310;
let dMapHeight = 100;
let mapDonut2 = new Donut(dMapWidth, dMapHeight, "#races", "mDonutTooltip");
let mapDonut = new Donut(dMapWidth, dMapHeight, "#places", "mDonutTooltip");



let dMapCategories = [
	{ label: "Home and neighborhood", sub: ["Residential home/Neighborhood, Retail/Wholesale/Services facility", "Residential home/Neighborhood"], count: 0 },
	{ label: "School and educationnal", sub: ["Primary school", "Secondary school", "College/University/Adult education"], count: 0 },
	{ label: "Public facilities", sub: ["Medical/Care", "Public transportation", "Park/Wilderness", "Place of worship", "Restaurant/Cafe", "Retail/Wholesale/Services facility", "Entertainment Venue", "Street/Highway"], count: 0 },
	{ label: "Military facilities", sub: ["Government facility", "Military facility"], count: 0 },
	{ label: "Work place", sub: ["Company/Factory/Office"], count: 0 }
];
let dMapCategories2 = [
    { label: "Black", sub: ["Black American or African American"], count: 5 },
    { label: "White", sub: ["White American or European American"], count: 3 },
    { label: "Asian", sub: ["Asian American"], count: 1 },
    { label: "Other races", sub: ["Some other race","Unknown"], count: 2 }
];

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
	.attr("width", width)
	.attr("height", height)
	.append("g");

// Append Div for tooltip to SVG
var div = d3.select("body")
	.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)


// APPEND INFORMATIONS FIELDS IN THE TOOLTIP

// VICTIMS
let tooltipVictims = div.append("div")
	.attr("id", "victims");

tooltipVictims.append("div")
   .attr("id", "killed");

tooltipVictims.append("div")
   .attr("id", "injured");

// DRAWING LINE
let tooltipLine = div.append("hr")
	.attr("id", "separator");

// CONTEXT
let tootipcontext = div.append("div")
	.attr("id", "context");

tootipcontext.append("div")
   .attr("id", "title");

tootipcontext.append("div")
   .attr("id", "date");



// D3 Projection
var projection = d3.geo.albersUsa()
	.translate([width /2, height / 2])    // translate to center of screen
	.scale([500]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
	.projection(projection);  // tell path generator to use albersUsa projection


// Define linear scale for output
var color = d3.scale.linear()
	.range(["#74D5DD", "#08B6CE", "#398AD7", "#2F66A9"]);

var legendText = ["150+", "100-150", "50-100", "0-50"];



// Load in my states data!
d3.dsv(';')("datasets/mass-shootings-in-america.csv", function (data) {
	var expensesCount = d3.nest()
		.key(function (data) { return data.State; })
		.rollup(function (v) {
			return {
				Total_Number_of_Victims: d3.sum(v, function (e) { return e.Total_Number_of_Victims; }),
				r: reducevalue(d3.sum(v, function (e) { return e.Total_Number_of_Victims; }))
			};
		}).entries(data);
	// console.log(JSON.stringify(expensesCount));
	color.domain([0, 1, 2, 3]); // setting the range of the input data

	// Load GeoJSON data and merge with states data
	d3.json("datasets/us-states.json", function (json) {

		// Loop through each state data value in the .csv file
		for (var i = 0; i < expensesCount.length; i++) {

			// Grab State Name
			var dataState = expensesCount[i].key;

			// Grab data value 
			var dataValue = expensesCount[i].values.r;

			// Find the corresponding state inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {
				var jsonState = json.features[j].properties.name;

				if (dataState == jsonState) {

					// Copy the data value into the JSON
					json.features[j].properties.r = dataValue;

					// Stop looking through the JSON
					break;
				}
			}
			
		}

		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
				.attr("d", path)
				.style("stroke", "#D5F3FE")
				.style("stroke-width", "1")
				.style("fill", function (d) {
					// Get data value
					var value = d.properties.r;
					// console.log(value);
					if (value) {
						return color(value);
					} else {
						return color(0);
					}
				})

			// MOUSEOVER
			.on("mouseover", function (d) {

			})

			// ON CLICK
			.on("click", function (d) {
				// GENERATE A NEW DONUTS
				let stateData = getStateData(d.properties.name, data);
				
				mapDonut2.generateDonut(colors, dMapCategories2, stateData, true);
				mapDonut.generateDonut(colors, dMapCategories, stateData, true);
				
			})

			// ON DOUBLE CLICK
			.on("dblclick", double_clicked);


		// ZOOM IN MAP
		function double_clicked(d) {
			var x, y, k;
			
			if (d && centered !== d) {
				var centroid = path.centroid(d);
				x = centroid[0];
				y = centroid[1];
				k = 4;
				centered = d;
			} else {
				x = width / 2;
				y = height / 2;
				k = 1;
				centered = null;
			}
			
			svg.selectAll("path")
				.classed("active", centered && function(d) { return d === centered; });
			
			svg.transition()
				.duration(750)
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				.style("stroke-width", 1.5 / k + "px");
			}


		d3.dsv(';')("datasets/mass-shootings-in-america.csv", function (data) {

			svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function (d) {
					
					return projection([d.Longitude, d.Latitude])[0];
				})
				.attr("cy", function (d) {
					return projection([d.Longitude, d.Latitude])[1];
				})
				.attr("r", function (d) {
					return 2;
				})
				.style("fill", "rgb(217,91,67)")
				.style("opacity", 0.85)

				.on("mouseover", function (d) {
					div.transition()
						.duration(200)
						.style("opacity", 1)
						.style("width",(280) + "px")
						.style("length",(250) + "px")
						.style("left", (450) + "px")
						.style("top", (390) + "px");
					// FILL INFORMATIONS ABOUT THE SHOOTING

					d3.select("#title")
					  .text(d.Title);

				    d3.select("#date")
					  .html("<font color=\"red\" style='font-size: 0.7em;'>" + d.Date_detailed + "</font>");

					d3.select("#killed")
					  .html("<b style='font-size: 0.9em;'><font color=\"red\">" + Math.floor(d.Number_of_Victim_Fatalities) + "</font> killed</b>" );

					d3.select("#injured")
					  .html("<b  style='font-size: 0.9em;'><font color=\"red\">" + Math.floor(d.Number_of_Victims_Injured) + "</font> injured</b>");

					

				   


				})

				
			             
				
		});

	
		var legend = d3.select("#legend")
			.attr("class", "legend")
			.attr("width", 140)
			.attr("height", 200)
			.selectAll("g")
			.data(color.domain().slice().reverse())
			.enter()
			.append("g")
			.attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			.attr("width", 12)
			.attr("height", 12)
			.style("fill", color);

		legend.append("text")
			.data(legendText)
			.attr("x", 16)
			.attr("y", 7)
			.attr("dy", ".20em")
			.text(function (d) { return d; });
	});

});


function reducevalue(value) {

    if (value <= 50) {
        value = 0;
    } else if (value <= 100) {
        value = 1;
    } else if (value <= 150) {
        value = 2;
    } else {
        value = 3;
    }
    return value
}


/**
 * Get all data refering to a State
 * @param {*} state 
 * @param {*} data 
 */
function getStateData(state, data) {

    let ret = [];
    let local = JSON.parse(JSON.stringify(data));   // deep copy of JSON array
    local.forEach(function (d) {
        if (d.State == state) {
            ret.push(d);
        }
    });
    return ret;
}




function isBetween(a, b, value) {

    let min = Math.min(a, b);
    let max = Math.max(a, b);
    return value ? this >= min && this <= max : this > min && this < max;
}


function countBarOccurences(categories, data) {

    let local = JSON.parse(JSON.stringify(data));
    let localCat = JSON.parse(JSON.stringify(categories));

    local.forEach(function (d) {
        localCat.forEach(function (c) {
            if (isBetween (c.sub[0], c.sub[1], d.Average_Shooter_Age)) {
                c.count += 1;
            }
        });
    });
    return localCat;
}


/**
 * Return labels of the chart
 * @param {*} categories 
 */
function getLabels(categories) {
    let labels = [];
    categories.forEach(function (c) {
        labels.push(c.label);
    })
    return labels;
}



function makeRange(range, data) {

    let local = JSON.parse(JSON.stringify(data));
    let localrange = JSON.parse(JSON.stringify(range));

    local.forEach(function (d) {
        let age = d.Average_Shooter_Age;
        localCat.forEach(function (c) {
            if (c['sub'].includes(place)) {
                c['count'] += 1;
            }
        });
    });
    return localrange;
}



