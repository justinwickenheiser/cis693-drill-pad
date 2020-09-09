class DPPerformer extends paper.PointText {
	// object properties
	performerId = null;
	drillNumber = {
		number: 0,
		angle: 270 // top
		// angle: 0 // right
		// angle: 90 // bottom
		// angle: 180 // left
	};
	drillNumberElement = null; // PaperJS Group
	positionSet = {
		// chartId: [ <Point> ] --> each <Point> matches w/ the Count in the chartId. Therefore
		//		the length of the array = # counts in chart + 1 (+1 for the initial position index [0])
	}

	constructor(obj) {
		super(obj);
		var dpPerformer = this;

		if (obj === undefined) {
			obj = {};
		}
		if (obj.performerId !== undefined) {
			dpPerformer.setPerformerId(obj.performerId);
		}
		if (obj.drillNumber === undefined) {
			obj.drillNumber = {};
		}
		if (obj.drillNumber.number !== undefined) {
			dpPerformer.setDrillNumber(obj.drillNumber.number);
		}

		dpPerformer.buildDrillNumberElement();
	}

	// PERFORMERID
	getPerformerId() {
		return this.performerId;
	}
	// the performerId (val) must be a string w/ a length > 0
	setPerformerId(val) {
		if(typeof(val) === 'string' && val.length > 0) {
			this.performerId = val;
			return true;
		}
		return false;
	}

	// DRILLNUMBER
	getDrillNumber() {
		return this.drillNumber;
	}
	// the drillNumber (val) must be a number w/ a value > 0
	setDrillNumber(val) {
		if(typeof(val) === 'number' && val > 0) {
			this.drillNumber.number = val;
			return true; 
		}
		return false;
	}
	buildDrillNumberElement() {
		var numPoint = new paper.Point({
			length: 15,
			angle: this.drillNumber.angle
		});
		var point = this.position.add(numPoint);
		var num = new paper.PointText({
			content: this.drillNumber.number,
			point: point,
			fillColor: 'black',
			fontFamily: 'Arial',
			fontSize: '8px',
			name: 'drillNumber'
		});
		num.position = point;

		var vector = num.position.subtract(this.position);
		var linePoint = new paper.Point({
			length: 10,
			angle: vector.angle
		});

		var line = new paper.Path({
			segments: [this.position, this.position.add(linePoint)],
			strokeColor: 'red',
			name: 'line'
		});

		this.drillNumberElement = new Group(num, line);
	}
	updateDrillNumberPosition() {
		var numPoint = new paper.Point({
			length: 15,
			angle: this.drillNumber.angle
		});

		var num = this.drillNumberElement.children.drillNumber;
		// update number position
		num.position = this.position.add(numPoint);
		// update line
		var vector = num.position.subtract(this.position);
		var linePoint = new paper.Point({
			length: 10,
			angle: vector.angle
		});

		var line = this.drillNumberElement.children.line;
		line.removeSegments();
		line.add(this.position);
		line.add(this.position.add(linePoint));
		this.bringToFront();
	}

	// POSITIONSET
	setPositionSets(obj) {
		if (typeof(obj) === 'object') {
			this.positionSet = JSON.parse(JSON.stringify(obj));
			return true;
		}
		return false;
	};
	// Set a <Point> for given count in a given chart
	setPositionSet(val, chartId, countIdx, insert) {
		if (chartId === undefined) {
			// we cannot set a position if we do not know the chart
			return false;
		}

		// If the chartId is not in the positionSet object, create it w/ an empty array.
		if (this.positionSet[chartId] === undefined) {
			this.positionSet[chartId] = [];
			// TO-DO:
			// I don't know if this would ever happen, but if that chart has counts > 0, we need to initialize the positionSet for the chart
		}

		if (countIdx === undefined) {
			countIdx = this.positionSet[chartId].length;
		}
		if (insert === undefined) {
			insert = false; // replace
		}

		if (val !== null && typeof(val) === 'object') {
			if (countIdx >= 0 && countIdx <= this.positionSet[chartId].length) {
				if (insert || this.removePositionSet(chartId, countIdx)) {
					this.positionSet[chartId].splice(countIdx, 0, val);
					return true;
				}
			}
		}
		return false;
	}
	removePositionSet(chartId, countIdx) {
		if (chartId === undefined) {
			return false;
		}
		// We are deleting the whole chart
		if (countIdx === undefined) {
			delete this.positionSet[chartId];
		} else if (countIdx >=0 && countIdx < this.positionSet[chartId].length) {
			// we are only deleting the specified count
			this.positionSet[chartId].splice(countIdx, 1);
		}
		return true;
	}
	getPositionSets() {
		return this.positionSet;
	}
	// Returns the array of all positions for each count of the given ChartId
	getPositionSets(chartId) {
		return this.positionSet[chartId];
	}
	// Returns a PaperJS Point object
	getPositionSet(chartId, countIdx) {
		return this.positionSet[chartId][countIdx];
	}
	initializePositionSets(dpEditor) {
		// ===========================================
		// Loop through every chart in the editor and
		// trimPositionSet for each chart. This should
		// be called when a performer is added.
		// ===========================================
		if (dpEditor !== null && typeof(dpEditor) === 'object' && dpEditor.constructor === DPEditor) {
			var charts = dpEditor.getDPCharts();
			// loop through every chart
			for (var i = 0; i < charts.length; i++) {
				// get chartId and counts for the current chart in loop
				var chart = charts[i];
				var chartId = chart.getChartId();
				var counts = chart.getCounts();
				this.trimPositionSet(chartId, counts);
			}
			return true;
		}
		return false;
	}
	trimPositionSet(chartId, counts) {
		// ===========================================
		// Set the performer's array of positions for 
		// given chartId to be equal to the number of
		// counts + 1. The + 1 accounts for the
		// initial position (index [0]).
		// ===========================================

		if (chartId === undefined ) {
			// we musts have a valid chart that exists.
			return false;
		}
		if (this.positionSet[chartId] === undefined) {
			// this is a new chart, 
			this.positionSet[chartId] = []
			// TO-DO:
			// so we need to set the initial position to last position of the previous chart.
			
		}
		if (counts === undefined) {
			counts = 0;
		}

		var currentPositions = this.positionSet[chartId].length;
		var neededPositions = counts+1;
		if (currentPositions < neededPositions) {
			// add a position that matches the current last position for the chart
			// for now, let's just pad them w/ [0,0]
			for (var idx = currentPositions; idx < neededPositions; idx++) {
				this.setPositionSet(new paper.Point([0,0]), chartId, idx);
			}
			return true;
		} else if (currentPositions > neededPositions && currentPositions > 1) {
			// check for currentPositions > 1  because it will be 1 when there are 0 counts and we don't want to delete that
			// remove the end ones
			for (idx = currentPositions-1; idx > counts; idx--) {
				this.removePositionSet(chartId, idx);
			}
			return true;
		}
		return false;
	}
}