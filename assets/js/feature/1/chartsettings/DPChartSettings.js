class DPChartSettings extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		var dpChartSettings = this;
		// open the modal
		dpEditor.showUIModal( dpChartSettings, 'Chart Settings', dpChartSettings.getFormDom() );
	}

	getFormDom() {
		var chart = dpEditor.getDPChart(dpEditor.getActiveChartIdx());
		var dom = $('<div>');
		var p = $('<p>');

		// Chart Title
		$('<label>', {
			'for': 'chartTitle',
			'text': 'Title '
		}).appendTo(p);
		$('<input>', {
			'id': 'chartTitle',
			'type': 'text',
			'value': chart.getTitle()
		}).appendTo(p);
		p.appendTo(dom);
		p = $('<p>');

		// Counts
		$('<label>', {
			'for': 'counts',
			'text': 'Counts to Next Chart'
		}).appendTo(p);
		$('<input>', {
			'id': 'counts',
			'type': 'number',
			'value': chart.getCounts()
		}).appendTo(p);
		p.appendTo(dom);

		dom.append($('<div>', {
			'text': '* indicates a required field',
			'class': 'req'
		}));
		
		return dom;
	}

	saveFormDom(dpEditor) {
		var chartIdx = dpEditor.getActiveChartIdx(),
			chart = dpEditor.getDPChart(chartIdx),
			chartId = chart.getChartId(),
			chartTitle = $('#chartTitle').val(),
			counts = parseInt( $('#counts').val() );

		chart.setTitle(chartTitle);
		chart.setCounts(counts);

		// TO-DO:
		// After setting the counts, we need to make sure every performer has the correct (new) number of counts for the given chart
		// Situations:
		//		

		dpEditor.clearActiveFeature();
		dpEditor.redraw();
	}

}