class DPPerformerManager extends DPFeature {
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
			'text': 'ID'
		})).append($('<th>', {
			'text': 'Performer Indicator',
			'css': {
				'text-align' : 'center'
			}
		})).append($('<th>', {
			'text': 'Performer Number',
			'css': {
				'text-align' : 'center'
			}
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

		var performers = dpEditor.getDPPerformers();
		for (var i = 0; i < performers.length; i++) {
			this.buildTableRow(performers[i], tbody, i);
		}
		

	}

	buildTableRow(performer, tbody, performerIdx) {
		var dpPerformerManager = this;
		var tr, td, label, input, a, span;
		tr = $('<tr>', {}).appendTo(tbody);
		tr.append($('<td>', {
			'text': performer.getPerformerId()
		})).append($('<td>', {
			'text': performer.content,
			'css': {
				'text-align' : 'center'
			}
		})).append($('<td>', {
			'text': performer.getDrillNumber().number,
			'css': {
				'text-align' : 'center'
			}
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
			value: performer.id,
			checked: performer.selected
		}).bind("change", {}, function() {
			var item = project.getItem({id: parseInt(this.value)});
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
			value: performer.id,
			checked: performer.visible
		}).bind("change", {}, function() {
			
			var item = project.getItem({id: parseInt(this.value)});
			var changeTo = !item.visible;
			item.visible = changeTo;
			item.getDrillNumberElement().visible = changeTo;
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
		a.bind("click", {performerIdx: performerIdx}, function(event) {
			var confirmed = confirm("Are you sure you want to delete this performer?");
			if (confirmed) {
				dpEditor.removeDPPerformer(performerIdx);

				dpEditor.redraw();

				dpEditor.ui.controls.parent.empty();
				dpPerformerManager.setControlDom();	
			}
		});
	}
	
}