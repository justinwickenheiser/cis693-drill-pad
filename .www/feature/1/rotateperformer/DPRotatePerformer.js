class DPRotatePerformer extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		// Pre-check
		if (Object.keys(dpEditor.getSelectedPerformers()).length == 0) {
			alert('At least one performer needs to be selected.');
			dpEditor.clearActiveFeature();
			return false;
		}

		var dpRotatePerformer = this;
		dpEditor.showUIModal( dpRotatePerformer, 'Rotate Performers', dpRotatePerformer.getFormDom() );
	}

	getFormDom() {
		var dom = $('<div>').append($('<p>', {
			'text': 'Apply rotations to the selected performers. Rotate a certain number of degrees over the given number of counts around the specified reference point.'
		}));

		var dpRotatePerformer = this;
		var p, label, select, option, input, row, col1, col2, col3, col4;
		row = $('<div>',{
			class: 'row'
		}).appendTo(dom);
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
		

		// Degrees
		p = $('<p>').appendTo(col1);
		$('<label>', {
			'for': 'degrees',
			'text': 'Number of degrees'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<input>', {
			'id': 'degrees',
			'class': 'degrees',
			'type': 'number',
			'required': 'true',
			'message': 'Enter the number of degrees to rotate.'
		}).appendTo(p);

		// Counts
		var p = $('<p>').appendTo(col2);
		$('<label>', {
			'for': 'counts',
			'text': 'Number of Counts'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<input>', {
			'id': 'counts',
			'class': 'counts',
			'type': 'number',
			'required': 'true',
			'message': 'Enter the number of counts to rotate.'
		}).appendTo(p);

		// Direction of Rotation
		p = $('<p>').appendTo(col3);
		label = $('<label>', {
			for: 'direction',
			text: 'Direction of Rotation'
		}).appendTo(p);
		select = $('<select>', {
			id: 'direction'
		}).appendTo(p);
		select.append($('<option>', {
			value: DP.ROTATE.CW,
			text: 'Clockwise'
		})).append($('<option>', {
			value: DP.ROTATE.CCW,
			text: 'Counter-Clockwise'
		}));

		// Point of Rotation
		p = $('<p>').appendTo(col4);
		label = $('<label>', {
			for: 'pointOfRotation',
			text: 'Point of Rotation'
		}).appendTo(p);
		select = $('<select>', {
			id: 'pointOfRotation'
		}).appendTo(p);
		select.append($('<option>', {
			value: '',
			text: 'Center of Field'
		}));
		var refPoints = project.getItems({data: {className: 'refPoint'} });
		for (var i=0; i<refPoints.length; i++) {
			select.append($('<option>', {
				value: refPoints[i].name,
				text: 'Point ' + (i+1)
			}));
		}

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
			chartCounts = chart.getCounts(),
			currentCount = chart.getActiveCountIdx(),
			degrees = parseInt( $('#degrees').val() ),
			counts = parseInt( $('#counts').val() ),
			direction = parseInt( $('#direction').val() ),
			pointOfRotationName = $('#pointOfRotation').val(),
			pointOfRotation = project.getItem({name: pointOfRotationName}),
			moveSetArray = [];
		
		if (pointOfRotation == null) {
			pointOfRotation = project.getItem({name: '50_center'});
		}

		moveSetArray.push({
			move: direction, // apply this direction rotaion
			counts: counts, // over this many counts
			rotation: {
				pointOfRotation: pointOfRotation.position, // around this point of rotation
				degreesPerCount: (degrees/counts), // moving degrees Per Count
			}
		});

		// Are we trying to apply more counts than we can handle?
		if (currentCount + counts > chartCounts) {
			alert('You are trying to apply more counts than there are in this chart based on the currently active count. Either add more counts to the chart in the Chart Settings, or move to an earlier active count.');
			dpEditor.clearActiveFeature();
			return false;
		} else {
			dpEditor.applyToPerformers(DP.LOGIC.APPLY_MOVESETARRAY.CODE, {
				moveSetArray: moveSetArray,
				chartId: chartId,
				countIdx: currentCount
			}, true);
		}
	}

}