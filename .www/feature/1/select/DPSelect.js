class DPSelect extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
		var selectionPath;
	}

	onclick() {
		var dpSelect = this;
		var performers = dpEditor.getDPPerformers();

		view.onMouseDown = function(event) {
			// If we produced a path before, deselect it:
			if (dpSelect.selectionPath) {
				dpSelect.selectionPath.selected = false;
				dpSelect.selectionPath.remove();
			}

			// Create a new path and set its stroke color to black:
			dpSelect.selectionPath = new paper.Path({
				segments: [event.point],
				strokeColor: 'black'
			});
		}

		view.onMouseDrag = function(event) {
			dpSelect.selectionPath.add(event.point);
		}

		view.onMouseUp = function(event) {
			// When the mouse is released, simplify it:
			dpSelect.selectionPath.closePath();
			dpSelect.selectionPath.simplify(10);
			// loop over each performer and check if it resides in the selection
			for (var p = 0; p < performers.length; p++) {
				if ( dpSelect.selectionPath.contains(performers[p].position) ) {
					performers[p].selected = true;
					dpEditor.setSelectedPerformer(performers[p]);
				} else {
					performers[p].selected = false;
					dpEditor.removeSelectedPerformer(performers[p].getPerformerId());
				}
			}
			dpSelect.selectionPath.remove();
		}

	}

	deselect() {
		view.onMouseDown = null;
		view.onMouseDrag = null;
		view.onMouseUp = null;
	}

}