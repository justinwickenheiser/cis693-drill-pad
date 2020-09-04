class DPAddPerformer extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		dpEditor.view.onMouseUp = function(event) {
			var position;
			if (event.event.shiftKey) {
				// "snap to grid. i.e. round to something divisible by pps"
				position = new paper.Point( [Math.round(event.point.x/dpEditor.settings.pps)*dpEditor.settings.pps, Math.round(event.point.y/dpEditor.settings.pps)*dpEditor.settings.pps] );
			} else {
				position = event.point;
			}
			
			var newPerf = new DPPerformer({
				'performerId': uuidv4(),
				'drillNumber': {
					number: dpEditor.getDPPerformers().length + 1
				},
				// Set some of the Paper PointText properties
				content: 'X',
				point: position,
				fillColor: 'black',
				fontFamily: 'Arial'
			});
			// this needs to be reset because adding the Content shifts the size of the bounding box
			newPerf.position = position;
			// we manually updated position, so update the DrillNum position too
			newPerf.updateDrillNumberPosition();

			// Give the performer the ability to be dragged.
			newPerf.onMouseDrag = function(event) {
				var chartIdx = dpEditor.getActiveChartIdx();
				var chart = dpEditor.getDPChart(chartIdx);
				var countIdx = chart.getActiveCountIdx();
				var chartId = chart.getChartId();

				// update the position visually
				if (event.event.shiftKey) {
					// "snap to grid. i.e. round to something divisible by pps"
					this.position = [Math.round(event.point.x/dpEditor.settings.pps)*dpEditor.settings.pps, Math.round(event.point.y/dpEditor.settings.pps)*dpEditor.settings.pps];
				} else {
					this.position = this.position.add(event.delta);
				}
				// update the drillNumber position
				this.updateDrillNumberPosition();
				// TO-DO:
				// Update the position for the active chart & count
				this.getPositionSet(chartId, countIdx).x = this.position.x;
				this.getPositionSet(chartId, countIdx).y = this.position.y;
			}

			// Set the position in the performer's positionSet
			var chartIdx = dpEditor.getActiveChartIdx();
			var chart = dpEditor.getDPChart(chartIdx);
			// set current position for activeCountIdx in the current activeChart
			newPerf.setPositionSet(position, chart.getChartId(), chart.getActiveCountIdx());

			// Add this new performer to the editor
			dpEditor.setDPPerformer( newPerf );
		}
	}

	deselect() {
		dpEditor.view.onMouseUp = null;
	}

	
}