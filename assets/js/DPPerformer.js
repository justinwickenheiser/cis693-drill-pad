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
		this.drillNumberElement.sendToBack();
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
			var previousPosition = this.getPositionSet(chartId, currentPositions-1);
			for (var idx = currentPositions; idx < neededPositions; idx++) {
				if (previousPosition != undefined) {
					this.setPositionSet(previousPosition, chartId, idx);
				} else {
					this.setPositionSet(new paper.Point([0,0]), chartId, idx);
				}
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

	// Applying Moves
	applyMoveSet(moveSet, chartId, countIdx) {
		// apply the moveSet using the position of current chart & count as starting position
		var point = this.getPositionSet(chartId, countIdx);
		/* moveSet = {
		 *		move: Helpers.MOVE.<value>,
		 *		counts: <number>,
		 *		stepSize: <number>, [optional]
		 *		pps: <number>, [optional]
		 * }
		 */
		for (var count = 1; count <= moveSet.counts; count++) {
			var p = DP.getNextPosition(point, moveSet.move, count, moveSet.stepSize, moveSet.pps);
			this.setPositionSet(p , chartId, countIdx+count);
		}
	}
	applyMoveSetArray(moveSetArray, chartId, countIdx) {
		/* moveSetArray = [{
		 *		move: Helpers.MOVE.<value>,
		 *		counts: <number>,
		 *		stepSize: <number>, [optional]
		 *		pps: <number>, [optional]
		 * }]
		 */
		var newCountIdx = countIdx;
		for (var set = 0; set < moveSetArray.length; set++) {
			// for each set, apply it to the point
			this.applyMoveSet(moveSetArray[set], chartId, newCountIdx);
			// we need to set the newCountIdx to be the last count the applyMoveSet created
			newCountIdx += moveSetArray[set].counts;
		}
	}
	applyPatternSet(patternSet, chartId, countIdx) {
		/*
		 * Check https://github.com/justinwickenheiser/cis693-drill-pad/wiki/Move-Pattern-Sets for more details
		 * on how a PatternSet is structured.
		 */
		var newCountIdx = countIdx;
		var newCountIdxPosition = this.getPositionSet(chartId, countIdx);
		var remainingCounts = patternSet.counts;
		var buildRef = new Point([0,0]);

		// Loop throught each pattern
		for (var patternIdx = 0; patternIdx < patternSet.patterns.length; patternIdx++) {
			var ptrnObj = patternSet.patterns[patternIdx];
			var patternCounts = 0;
			var hitReference = false;
			var useReference = ((ptrnObj.reference !== undefined && ptrnObj.reference !== null) ? true : false);

			// how many counts are in this pattern?
			for (var mvSetIdx = 0; mvSetIdx < ptrnObj.pattern.length; mvSetIdx++) {
				patternCounts += ptrnObj.pattern[mvSetIdx].counts;
			}

			// Do we use a reference for this pattern? If so, it's business as usual
			if (useReference) {
				// Do a pre-check to see if we happen to start on the reference point
				buildRef.x = ( ptrnObj.reference.dimension.x ? newCountIdxPosition.x : ptrnObj.reference.point.x );
				buildRef.y = ( ptrnObj.reference.dimension.y ? newCountIdxPosition.y : ptrnObj.reference.point.y );
				if (buildRef.subtract(ptrnObj.reference.point).length == 0) {
					hitReference = true;
				}

				// If we haven't met the reference poinst AND we have enough counts for 1 more round through the pattern
				// patternCounts > 0 is there to help prevent an infinit loop
				while (!hitReference && remainingCounts >= patternCounts && patternCounts > 0) {
					// apply the pattern
					this.applyMoveSetArray(ptrnObj.pattern, chartId, newCountIdx);
					// reduce the remainingCounts
					remainingCounts -= patternCounts;
					// we need to set the newCountIdx to be the last count the applyMoveSet created
					newCountIdx += patternCounts;
					newCountIdxPosition = this.getPositionSet(chartId, newCountIdx);

					// now check against the reference
					buildRef.x = ( ptrnObj.reference.dimension.x ? newCountIdxPosition.x : ptrnObj.reference.point.x );
					buildRef.y = ( ptrnObj.reference.dimension.y ? newCountIdxPosition.y : ptrnObj.reference.point.y );
					// the vector length of the difference between this built ref point and the desired ref point
					if (buildRef.subtract(ptrnObj.reference.point).length == 0) {
						hitReference = true;
					}
				}

				// There is a chance we never met the reference point, but still have remainingCounts if the pattern
				// has more counts than there are remaining.
				// IMPORTANT: This method assumes a full run through the pattern before finishing remaining.
				// I should figure out a nice way to handle this situation, but I will assume Future Me can do Math correctly
				// when building the patternSet.pattern
				if (hitReference) {
					// if we hit the reference, then it is time to move to the next pattern. So do nothing
				} else {
					// we ran out available counts to run a full Pattern, but we never found the reference point
					console.log("[ Error: Not enough counts remaining to apply the full pattern. Remaining: "+remainingCounts+". Counts in full pattern: "+patternCounts+". Reference Point never reached. ]");
				}

				// ==============================================
				// We have finished looping through the pattern,
				// because we have met one of two conditions:
				// 		1. We hit the reference point
				//		2. we ran out of available counts
				// ==============================================
			} else {
				// This is when we do NOT use a reference for a pattern. In this case apply the pattern 1 time and 1 time only

				if (remainingCounts >= patternCounts && patternCounts > 0) {
					// apply the pattern
					this.applyMoveSetArray(ptrnObj.pattern, chartId, newCountIdx);
					// reduce the remainingCounts
					remainingCounts -= patternCounts;
					// we need to set the newCountIdx to be the last count the applyMoveSet created
					newCountIdx += patternCounts;
					newCountIdxPosition = this.getPositionSet(chartId, newCountIdx);
				} else {
					// we ran out available counts to run a full Pattern
					console.log("[ Error: Not enough counts remaining to apply the full pattern. Remaining: "+remainingCounts+". Counts in full pattern: "+patternCounts+" ]");
				}
			}
		}

		// finish remaining counts using the final moveSet
		patternSet.moveSet.counts = remainingCounts;
		this.applyMoveSet(patternSet.moveSet, chartId, newCountIdx);
	}
}