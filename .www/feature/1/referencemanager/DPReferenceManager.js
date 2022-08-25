class DPReferenceManager extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		dpEditor.ui.controls.parent.empty();
		this.setControlDom();
	}
	
	deselect() {
		dpEditor.ui.controls.parent.empty(); // clear the control panel
	}

	setControlDom() {
		var row, col, table, thead, tbody, tr, td;

		row = $('<div>',{
			class: 'row'
		}).appendTo(dpEditor.ui.controls.parent);
		col = $('<div>',{
			class: 'col-md-12'
		}).appendTo(row);

		table = $('<table>', {
			class: 'table table-striped'
		}).appendTo(col);
		thead = $('<thead>', {}).appendTo(table);
		tbody = $('<tbody>', {}).appendTo(table);
		tr = $('<tr>', {}).appendTo(thead);
		tr.append($('<th>', {
			'text': 'Type'
		})).append($('<th>', {
			'text': 'ID'
		})).append($('<th>', {
			'text': 'Selected',
			'css': {
				'text-align' : 'center'
			}
		})).append($('<th>', {
			'text': 'Visible',
			'css': {
				'text-align' : 'center'
			}
		})).append($('<th>', {
			'text': 'Delete',
			'css': {
				'text-align' : 'center'
			}
		}));

		var refPoints = project.getItems({data: {className: 'refPoint'}});
		for (var i = 0; i < refPoints.length; i++) {
			this.buildTableRow(refPoints[i], tbody, 'Point');
		}
		var refCircles = project.getItems({data: {className: 'refCircle'}});
		for (var i = 0; i < refCircles.length; i++) {
			this.buildTableRow(refCircles[i], tbody, 'Circle');
		}
		var refRectangles = project.getItems({data: {className: 'refRectangle'}});
		for (var i = 0; i < refRectangles.length; i++) {
			this.buildTableRow(refRectangles[i], tbody, 'Rectangle');
		}
		var refArcs = project.getItems({data: {className: 'refArc'}});
		for (var i = 0; i < refArcs.length; i++) {
			this.buildTableRow(refArcs[i], tbody, 'Arc');
		}

	}

	buildTableRow(ref, tbody, type) {
		var dpReferenceManager = this;
		var tr, td, label, input, a, span;
		tr = $('<tr>', {}).appendTo(tbody);
		tr.append($('<td>', {
			'text': type
		})).append($('<td>', {
			'text': ref.name
		}));
		// Selected
		td = $('<td>', {
			'css': {
				'text-align' : 'center'
			}
		}).appendTo(tr);
		label = $('<label>', {}).appendTo(td);
		input = $('<input>', {
			type: 'checkbox',
			value: ref.name,
			checked: ref.selected
		}).bind("change", {}, function() {
			var item = project.getItem({name: this.value});
			item.selected = !item.selected;
		}).appendTo(label);
		// Visible
		td = $('<td>', {
			'css': {
				'text-align' : 'center'
			}
		}).appendTo(tr);
		label = $('<label>', {}).appendTo(td);
		input = $('<input>', {
			type: 'checkbox',
			value: ref.name,
			checked: ref.visible
		}).bind("change", {}, function() {
			var item = project.getItem({name: this.value});
			item.visible = !item.visible;
		}).appendTo(label);
		// Delete
		td = $('<td>', {
			'css': {
				'text-align' : 'center'
			}
		}).appendTo(tr);
		a = $('<a>', {
			'class': 'btn btn-danger'
		}).appendTo(td);
		a.append($('<span>', {
			'class': 'fa fa-trash'
		}));
		a.bind("click", {name: ref.name}, function(event) {
			var confirmed = confirm("Are you sure you want to delete this reference?");
			if (confirmed) {
				project.getItem({name: event.data.name}).remove();
				dpEditor.ui.controls.parent.empty();
				dpReferenceManager.setControlDom();	
			}
		});
	}
	
}