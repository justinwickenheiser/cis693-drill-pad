class DPChartManager extends DPFeature {
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
			'text': 'Chart Number',
			'css': {
				'text-align' : 'center'
			}
		})).append($('<th>', {
			'text': 'Title',
			'css': {
				'text-align' : 'center'
			}
		})).append($('<th>', {
			'text': 'Counts',
			'css': {
				'text-align' : 'center'
			}
		})).append($('<th>', {
			'text': 'Delete',
			'css': {
				'text-align' : 'center'
			}
		}));

		var charts = dpEditor.getDPCharts();
		if (charts.length == 1) {
			this.buildTableRow(charts[0], tbody, 0, false);
		} else {
			for (var i = 0; i < charts.length; i++) {
				this.buildTableRow(charts[i], tbody, i, true);
			}
		}
		

	}

	buildTableRow(chart, tbody, chartIdx, includeDelete) {
		var dpChartManager = this;
		var tr, td, label, input, a, span;
		tr = $('<tr>', {}).appendTo(tbody);
		tr.append($('<td>', {
			'text': chart.getChartId()
		})).append($('<td>', {
			'text': chart.getChartNumber(),
			'css': {
				'text-align' : 'center'
			}
		})).append($('<td>', {
			'text': chart.getTitle(),
			'css': {
				'text-align' : 'center'
			}
		})).append($('<td>', {
			'text': chart.getCounts(),
			'css': {
				'text-align' : 'center'
			}
		}));
		
		// Delete
		td = $('<td>', {
			'css': {
				'text-align' : 'center'
			}
		}).appendTo(tr);
		if (includeDelete) {
			a = $('<a>', {
				'class': 'btn btn-danger'
			}).appendTo(td);
		} else {
			a = $('<a>', {
				'class': 'btn btn-danger disabled'
			}).appendTo(td);
		}
		
		a.append($('<span>', {
			'class': 'fa fa-trash'
		}));
		a.bind("click", {chartIdx: chartIdx}, function(event) {
			var confirmed = confirm("Are you sure you want to delete this chart?");
			if (confirmed) {
				// remove the chart
				var currentIdx = dpEditor.getActiveChartIdx();
				var chartId = chart.getChartId();

				// if we are deleting a chart that is currently active or prior to the active chart, we need to update the active chart
				if (currentIdx >= event.data.chartIdx) {
					dpEditor.setActiveChartIdx(Math.max(0, currentIdx-1));
				}
				dpEditor.removeDPChart(event.data.chartIdx);
				// update the UI by redrawing the editor
				dpEditor.redraw();

				// now remove the chartId from each performer's position list
				dpEditor.applyToPerformers(DP.LOGIC.REMOVE_CHARTID_FROM_POSITIONSET.CODE, {
					chartId: chartId
				});

				dpEditor.ui.controls.parent.empty();
				dpChartManager.setControlDom();	
			}
		});
	}
	
}