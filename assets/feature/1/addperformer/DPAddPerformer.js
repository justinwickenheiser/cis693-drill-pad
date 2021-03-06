class DPAddPerformer extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		// Pre-check
		var chartIdx = dpEditor.getActiveChartIdx(),
			chart = dpEditor.getDPChart(chartIdx),
			countIdx = chart.getActiveCountIdx();
		if (countIdx != 0) {
			alert('You can only add new performers when on Count 0 of the chart.');
			dpEditor.clearActiveFeature();
			return false;
		}

		dpEditor.ui.controls.parent.empty();
		this.setControlDom();
		this.updateDrawReferenceFnSet();
	}

	deselect() {
		dpEditor.view.onMouseDown = null;
		dpEditor.view.onMouseDrag = null;
		dpEditor.view.onMouseUp = null;
		dpEditor.ui.controls.parent.empty(); // clear the control panel
	}

	setControlDom() {
		var dpAddPerformer = this;
		var p, label, select, option, input, row, col1, col2, col3, col4;
		row = $('<div>',{
			class: 'row'
		}).appendTo(dpEditor.ui.controls.parent);
		col1 = $('<div>',{
			class: 'col-md-3'
		}).appendTo(row);
		col2 = $('<div>',{
			class: 'col-md-3'
		}).appendTo(row);
		col3 = $('<div>',{
			class: 'col-md-3'
		}).appendTo(row);
		col4 = $('<div>',{
			class: 'col-md-3'
		}).appendTo(row);

		// Type of Reference
		p = $('<p>', {
			id: 'drawingShapeContainer'
		}).appendTo(col1);
		label = $('<label>', {
			for: 'drawingShape',
			text: 'Shape'
		}).appendTo(p);
		select = $('<select>', {
			id: 'drawingShape'
		}).appendTo(p);
		select.append($('<option>', {
			value: DP.FNSET.DRAW_RECTANGLE,
			text: 'Rectangle'
		})).append($('<option>', {
			value: DP.FNSET.DRAW_CIRCLE,
			text: 'Circle'
		}));
		select.bind('change',{}, function() {
			dpAddPerformer.updateDrawReferenceFnSet();

			if (parseInt(this.value) == DP.FNSET.DRAW_RECTANGLE) {
				$('#spacingFBContainer').show();
				$('#spacingLRContainer').show();
				$('#numPointContainer').hide();
			} else {
				$('#spacingFBContainer').hide();
				$('#spacingLRContainer').hide();
				$('#numPointContainer').show();
			}
		});

		// Spacing Front-to-Back
		p = $('<p>', {
			id: 'spacingFBContainer'
		}).appendTo(col2);
		label = $('<label>', {
			for: 'spacingFB',
			text: 'Spacing Front-to-Back'
		}).appendTo(p);
		select = $('<select>', {
			id: 'spacingFB'
		}).appendTo(p);
		for (var i=1; i<=8; i++) {
			select.append($('<option>', {
				value: i,
				text: i + ' Step',
				selected: i == 4 ? true : false
			}));
		}

		// Spacing Left-to-Right
		p = $('<p>', {
			id: 'spacingLRContainer'
		}).appendTo(col3);
		label = $('<label>', {
			for: 'spacingLR',
			text: 'Spacing Left-to-Right'
		}).appendTo(p);
		select = $('<select>', {
			id: 'spacingLR'
		}).appendTo(p);
		for (var i=1; i<=8; i++) {
			select.append($('<option>', {
				value: i,
				text: i + ' Step',
				selected: i === 4 ? true : false
			}));
		}

		// Number of Points (for circle)
		p = $('<p>', {
			id: 'numPointContainer',
			css: {
				display: 'none'
			}
		}).appendTo(col2);
		label = $('<label>', {
			for: 'numPoint',
			text: 'Number of Performers to Add'
		}).appendTo(p);
		input = $('<input>', {
			id: 'numPoint',
			name: 'numPoint',
			type: 'number',
			value: '0'
		}).appendTo(p);
		input.bind('change',{}, function() {
			dpAddPerformer.updateDrawReferenceFnSet();
		});

		// Symbol
		p = $('<p>', {
			id: 'symbolContainer'
		}).appendTo(col4);
		label = $('<label>', {
			for: 'symbol',
			text: 'Symbol'
		}).appendTo(p);
		select = $('<select>', {
			id: 'symbol'
		}).appendTo(p);
		for (var i=0; i<26; i++) {
			select.append($('<option>', {
				value: String.fromCharCode(65 + i),
				text: String.fromCharCode(65 + i),
				selected: i === 23 ? true : false
			}));
		}

	}

	updateDrawReferenceFnSet() {
		var referenceType = parseInt( $('#drawingShape').val() );

		if (referenceType === DP.FNSET.DRAW_RECTANGLE) {
			var path, from, to;
			var layer = project.getItem({className: 'Layer', name: 'reference'});
			if (!layer) {
				layer = new paper.Layer({name: 'reference'});
			}

			dpEditor.view.onMouseDown = function(event) {
				if (event.event.shiftKey) {
					// "snap to grid. i.e. round to something divisible by pps"
					from = new paper.Point( [Math.round(event.point.x/dpEditor.settings.pps)*dpEditor.settings.pps, Math.round(event.point.y/dpEditor.settings.pps)*dpEditor.settings.pps] );
				} else {
					from = event.point;
				}
				// and clear the to:
				to = null;
			}

			dpEditor.view.onMouseDrag = function(event) {
				if (event.event.shiftKey) {
					// "snap to grid. i.e. round to something divisible by pps"
					to = new paper.Point( [Math.round(event.point.x/dpEditor.settings.pps)*dpEditor.settings.pps, Math.round(event.point.y/dpEditor.settings.pps)*dpEditor.settings.pps] );
				} else {
					to = event.point;
				}
				if (path != undefined) {
					path.remove();
				}
				path = new paper.Path.Rectangle({
					from: from,
					to: to,
					strokeColor: 'black',
					parent: layer
				});
			}

			dpEditor.view.onMouseUp = function(event) {
				if (to === undefined || to === null) {
					// there was no drag, so it was a simple click
					to = from;
				}
				// path is undefined if there was no drag (simple click)
				if (path != undefined) {
					// let's set the From to be the topLeft * the To to bottomRight
					from = path.bounds.topLeft;
					to = path.bounds.bottomRight;
				}

				var spacingFB = parseInt($('#spacingFB').val());
				var spacingLR = parseInt($('#spacingLR').val());
				var symbol = $('#symbol').val();


				// Check if there is a group for the symbol, if not create one.
				var group = project.getItem({className: 'Group', name: symbol});
				if (!group) {
					group = new paper.Group({name: symbol, parent: project.getItem({className: 'Layer', name: 'performer'})});
				}

				// divid the length of the vertical line by the spacingFB * pps. Then add 1 for the initial row.
				var rows = Math.floor(from.subtract(new paper.Point(from.x, to.y)).length / (spacingFB*dpEditor.settings.pps)) + 1;
				// divid the length of the horizontal line by the space * pps. Then add 1 for the initial column.
				var cols = Math.floor(from.subtract(new paper.Point(to.x, from.y)).length / (spacingLR*dpEditor.settings.pps)) + 1;

				for (var r = 0; r < rows; r++) {
					for (var c = 0; c < cols; c++) {
						var position = new paper.Point([from.add([spacingLR*c*dpEditor.settings.pps,spacingFB*r*dpEditor.settings.pps]).x, from.add([spacingLR*c*dpEditor.settings.pps,spacingFB*r*dpEditor.settings.pps]).y]);

						var newPerf = new DPPerformer({
							'performerId': uuidv4(),
							'drillNumber': {
								number: dpEditor.getDPPerformers().length + 1
							},
							// Set some of the Paper PointText properties
							content: symbol,
							point: position,
							fillColor: 'black',
							fontFamily: 'Arial',
							parent: group
						}, dpEditor);
						// this needs to be reset because adding the Content shifts the size of the bounding box
						newPerf.position = position;
						// we manually updated position, so update the DrillNum position too
						newPerf.updateDrillNumberPosition();

						// Set the position in the performer's positionSet
						var chartIdx = dpEditor.getActiveChartIdx();
						var chart = dpEditor.getDPChart(chartIdx);
						// initialize this performer w/ empty [0,0] point for all charts
						newPerf.initializePositionSets(dpEditor);
						// set current position for activeCountIdx in the current activeChart
						newPerf.setPositionSet(position, chart.getChartId(), chart.getActiveCountIdx());

						// Add this new performer to the editor
						dpEditor.setDPPerformer( newPerf );

					}
				}
				if (path != undefined) {
					path.remove();
				}
			}
		} else if (referenceType === DP.FNSET.DRAW_CIRCLE) {
			var center;
			var layer = project.getItem({className: 'Layer', name: 'reference'});
			if (!layer) {
				layer = new paper.Layer({name: 'reference'});
			}

			dpEditor.view.onMouseDown = function(event) {
				if (event.event.shiftKey) {
					// "snap to grid. i.e. round to something divisible by pps"
					center = new paper.Point( [Math.round(event.point.x/dpEditor.settings.pps)*dpEditor.settings.pps, Math.round(event.point.y/dpEditor.settings.pps)*dpEditor.settings.pps] );
				} else {
					center = event.point;
				}
			}

			dpEditor.view.onMouseDrag = function(event) {
				// calculate the radius between center drag event.point
				if (event.event.shiftKey) {
					// "snap to grid. i.e. round to something divisible by pps"
					to = new paper.Point( [Math.round(event.point.x/dpEditor.settings.pps)*dpEditor.settings.pps, Math.round(event.point.y/dpEditor.settings.pps)*dpEditor.settings.pps] );
				} else {
					to = event.point;
				}
				var vector = to.subtract(center).length;
				if (path != undefined) {
					path.remove();
				}
				path = new paper.Path.Circle({
					center: center,
					radius: vector,
					strokeColor: 'black',
					parent: layer
				});
			}

			dpEditor.view.onMouseUp = function(event) {
				var numPoints = parseInt($('#numPoint').val());
				var symbol = $('#symbol').val();

				// Check if there is a group for the symbol, if not create one.
				var group = project.getItem({className: 'Group', name: symbol});
				if (!group) {
					group = new paper.Group({name: symbol, parent: project.getItem({className: 'Layer', name: 'performer'})});
				}

				// calculate the radius between center drag event.point
				if (event.event.shiftKey) {
					// "snap to grid. i.e. round to something divisible by pps"
					to = new paper.Point( [Math.round(event.point.x/dpEditor.settings.pps)*dpEditor.settings.pps, Math.round(event.point.y/dpEditor.settings.pps)*dpEditor.settings.pps] );
				} else {
					to = event.point;
				}
				// handle if there are numPoints
				if (numPoints > 0) {
					var offset = path.length / numPoints;
					for (var i = 0; i < numPoints; i++) {
						var position = path.getPointAt(offset * i);
						var newPerf = new DPPerformer({
							'performerId': uuidv4(),
							'drillNumber': {
								number: dpEditor.getDPPerformers().length + 1
							},
							// Set some of the Paper PointText properties
							content: symbol,
							point: position,
							fillColor: 'black',
							fontFamily: 'Arial',
							parent: group
						}, dpEditor);
						// this needs to be reset because adding the Content shifts the size of the bounding box
						newPerf.position = position;
						// we manually updated position, so update the DrillNum position too
						newPerf.updateDrillNumberPosition();

						// Set the position in the performer's positionSet
						var chartIdx = dpEditor.getActiveChartIdx();
						var chart = dpEditor.getDPChart(chartIdx);
						// initialize this performer w/ empty [0,0] point for all charts
						newPerf.initializePositionSets(dpEditor);
						// set current position for activeCountIdx in the current activeChart
						newPerf.setPositionSet(position, chart.getChartId(), chart.getActiveCountIdx());

						// Add this new performer to the editor
						dpEditor.setDPPerformer( newPerf );
					}
				}

				if (path != undefined) {
					path.remove();
				}
			};
		}
	}

	
}