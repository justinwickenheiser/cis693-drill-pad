class DPAddPerformer extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		dpEditor.view.onMouseUp = function(event) {
			var position = event.point;
			var newPerf = new DPPerformer({
				'performerId': uuidv4(),
				// Set some of the Paper PointText properties
				content: 'X',
				point: position,
				fillColor: 'black',
				fontFamily: 'Arial'
			});
			// this needs to be reset because adding the Content shifts the size of the bounding box
			newPerf.position = position;

			// Give the performer the ability to be dragged.
			newPerf.onMouseDrag = function(event) {
				// update the position visually
				this.position = this.position.add(event.delta);
				// TO-DO:
				// Update the position for the active chart & count
			}
		}
	}

	deselect() {
		dpEditor.view.onMouseUp = null;
	}

	
}