class DPDrawReference extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		dpEditor.ui.controls.parent.empty();
		this.setControlDom();

		// TEMP:
		var fnSet = DP.getFnSet(DP.FNSET.DRAW_POINT);

		dpEditor.view.onMouseDown = fnSet.onMouseDown;
		dpEditor.view.onMouseDrag = fnSet.onMouseDrag;
		dpEditor.view.onMouseUp = fnSet.onMouseUp;
	}
	

	deselect() {
		dpEditor.view.onMouseDown = null;
		dpEditor.view.onMouseDrag = null;
		dpEditor.view.onMouseUp = null;
		dpEditor.ui.controls.parent.empty(); // clear the control panel
	}

	setControlDom() {
		var dpDrawReference = this;
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
			id: 'referenceTypeContainer'
		}).appendTo(col1);
		label = $('<label>', {
			for: 'referenceType',
			text: 'Type of Reference Object'
		}).appendTo(p);
		select = $('<select>', {
			id: 'referenceType'
		}).appendTo(p);
		select.append($('<option>', {
			value: DP.FNSET.DRAW_POINT,
			text: 'Point'
		})).append($('<option>', {
			value: DP.FNSET.DRAW_CIRCLE,
			text: 'Circle'
		})).append($('<option>', {
			value: DP.FNSET.DRAW_RECTANGLE,
			text: 'Rectangle'
		})).append($('<option>', {
			value: DP.FNSET.DRAW_ARC,
			text: 'Arc'
		}));
		select.bind('change',{}, function() {
			dpDrawReference.updateDrawReferenceFnSet();

			if (parseInt(this.value) == DP.FNSET.DRAW_ARC) {
				// If Arc: populate the arcThroughPoint Select
				var refPoints = project.getItems({data: {className: 'refPoint'} });
				var select = $('#arcThroughPoint');
				select.empty();
				select.append($('<option>', {
					value: '',
					text: '- Select A point'
				}));
				for (var i=0; i<refPoints.length; i++) {
					select.append($('<option>', {
						value: refPoints[i].name,
						text: 'Point ' + (i+1)
					}));
				}
			}
		});

		// Arc Through Point
		p = $('<p>', {
			id: 'arcThroughPointContainer'
		}).appendTo(col2);
		label = $('<label>', {
			for: 'arcThroughPoint',
			text: 'Arc Through Point'
		}).appendTo(p);
		select = $('<select>', {
			id: 'arcThroughPoint'
		}).appendTo(p);
		select.append($('<option>', {
			value: '',
			text: '- Select A point'
		}));
		select.bind('change',{}, function() {
			// unselect all reference points and select the chosen one;
			var refPoints = project.getItems({data: {className: 'refPoint'} });
			for (var i=0; i<refPoints.length; i++) {
				refPoints[i].selected = false;
			}
			if (this.value.length) {
				var selectedPoint = project.getItem({name: this.value});
				selectedPoint.selected = true;
			}
			// re-call getFnSet for DRAW_ARC w/ specific through point
			dpDrawReference.updateDrawReferenceFnSet();
		});

		// Arc Through Point
		p = $('<p>', {
			id: 'numPointContainer'
		}).appendTo(col3);
		label = $('<label>', {
			for: 'numPoint',
			text: 'Number of Points to Add'
		}).appendTo(p);
		input = $('<input>', {
			id: 'numPoint',
			name: 'numPoint',
			type: 'number',
			value: '0'
		}).appendTo(p);
		input.bind('change',{}, function() {
			dpDrawReference.updateDrawReferenceFnSet();
		});


		// FOR THE RECTANGLE
		row = $('<div>',{
			class: 'row'
		}).appendTo(dpEditor.ui.controls.parent);
		col1 = $('<div>',{
			class: 'col-md-3'
		}).appendTo(row);
		col2 = $('<div>',{
			class: 'col-md-3'
		}).appendTo(row);
		
		// Spacing Front-to-Back
		p = $('<p>', {
			id: 'spacingFBContainer'
		}).appendTo(col1);
		label = $('<label>', {
			for: 'spacingFB',
			text: 'Spacing Front-to-Back'
		}).appendTo(p);
		select = $('<select>', {
			id: 'spacingFB'
		}).appendTo(p);
		select.append($('<option>', {
			value: 0,
			text: 'No Spacing'
		}));
		select.bind('change',{}, function() {
			dpDrawReference.updateDrawReferenceFnSet();
		});
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
		}).appendTo(col2);
		label = $('<label>', {
			for: 'spacingLR',
			text: 'Spacing Left-to-Right'
		}).appendTo(p);
		select = $('<select>', {
			id: 'spacingLR'
		}).appendTo(p);
		select.append($('<option>', {
			value: 0,
			text: 'No Spacing'
		}));
		select.bind('change',{}, function() {
			dpDrawReference.updateDrawReferenceFnSet();
		});
		for (var i=1; i<=8; i++) {
			select.append($('<option>', {
				value: i,
				text: i + ' Step',
				selected: i === 4 ? true : false
			}));
		}

	}

	updateDrawReferenceFnSet() {
		var referenceType = parseInt( $('#referenceType').val() );
		var numPoints = 0;
		if ( parseInt($('#numPoint').val()) ) {
			numPoints =  parseInt( $('#numPoint').val() );
		}
		var through = null;
		if ($('#arcThroughPoint').val().length) {
			through = project.getItem({name: $('#arcThroughPoint').val()}).position;
		}
		var spacingFB = 0;
		if ($('#spacingFB').val().length) {
			spacingFB = parseInt( $('#spacingFB').val() );
		}
		var spacingLR = 0;
		if ($('#spacingLR').val().length) {
			spacingLR = parseInt( $('#spacingLR').val() );
		}

		var fnSet = {
			onMouseDown: null,
			onMouseDrag: null,
			onMouseUp: null
		};

		if (referenceType === DP.FNSET.DRAW_POINT) {
			fnSet = DP.getFnSet( DP.FNSET.DRAW_POINT );
		} else if (referenceType === DP.FNSET.DRAW_CIRCLE) {
			fnSet = DP.getFnSet( DP.FNSET.DRAW_CIRCLE, {
				numPoints: numPoints
			});
		} else if (referenceType === DP.FNSET.DRAW_RECTANGLE) {
			fnSet = DP.getFnSet( DP.FNSET.DRAW_RECTANGLE, {
				spacingLR: spacingLR,
				spacingFB: spacingFB
			});
		} else if (referenceType === DP.FNSET.DRAW_ARC) {
			fnSet = DP.getFnSet(DP.FNSET.DRAW_ARC, {
				through: through,
				numPoints: numPoints
			});
		}

		dpEditor.view.onMouseDown = fnSet.onMouseDown;
		dpEditor.view.onMouseDrag = fnSet.onMouseDrag;
		dpEditor.view.onMouseUp = fnSet.onMouseUp;
	}

	
}