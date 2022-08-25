class DPMovePerformer extends DPFeature {
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

		var dpMovePerformer = this;
		dpEditor.showUIModal( dpMovePerformer, 'Move Performers', dpMovePerformer.getFormDom() );
	}

	getFormDom() {
		var dpMovePerformer = this;
		var dom = $('<div>').append($('<p>', {
			'text': 'Apply simple instructions to move the selected performers from the current chart to the next chart. Movement directions are from the performers\'s perspective.'
		}));

		// Total Counts
		var p = $('<p>').appendTo(dom);
		$('<label>', {
			'for': 'totalCounts',
			'text': 'Total Number of Counts'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<input>', {
			'id': 'totalCounts',
			'class': 'counts',
			'type': 'number',
			'required': 'true',
			'message': 'Please enter the total number of counts.'
		}).appendTo(p);

		var patternCount = $('<input>',{
			name: 'patternCount',
			id: 'patternCount',
			type: 'hidden',
			value: '0'
		}).appendTo(dom);

		dom.append($('<div>', {
			'id': 'patternSetContainer'
		}));

		dom.append($('<div>', {
			'id': 'finalMoveSetContainer'
		}));

		var p = $('<p>').appendTo(dom);
		var a = $('<a>', {
			'class': 'btn btn-success',
			'css': {
				'margin-right' : '.5em'
			}
		}).on('click',function(){
			return dpMovePerformer.addPattern();
		}).appendTo(p);
		a.append($('<span>', {
			'class': 'fa fa-plus'
		}));
		a.append(' Pattern');

		var a = $('<a>', {
			'id': 'finalMoveSetButton',
			'class': 'btn btn-primary'
		}).on('click',function(){
			return dpMovePerformer.addFinalInstruction();
		}).appendTo(p);
		a.append($('<span>', {
			'class': 'fa fa-plus'
		}));
		a.append(' Final Instruction');

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
			performers = dpEditor.getSelectedPerformers(),
			keys = Object.keys(performers),
			totalCounts = parseInt( $('#totalCounts').val() );

		var patterns = $('.patternRow');
		var usedCounts = 0;
		var patternSetArray = [];
		var basicFieldReferences = DP.buildFieldReferenceObject();

		for (var ptrn=0; ptrn < patterns.length; ptrn++) {
			var instructions = patterns[ptrn].querySelectorAll('.moveSetRow');

			// build the moveSetArray (pattern)
			var moveSetArray = [];
			var moveType,stepSize,counts;

			for (var i=0; i<instructions.length; i++) {
				moveType = parseInt( $( instructions[i] ).find('.moveType').val() );
				stepSize = parseInt( $( instructions[i] ).find('.stepSize').val() );
				counts = parseInt( $( instructions[i] ).find('.counts').val() );
				usedCounts += counts;

				moveSetArray.push({
					move: moveType,
					counts: counts,
					stepSize: stepSize
				});
			}

			// build the reference
			var reference = null;
			if (patterns[ptrn].querySelector('.patternReferencePoint') !== null) {
				var refPointName = $(patterns[ptrn]).find('.patternReferencePoint').val();
				reference = {
					point: project.getItem({name: refPointName}).position,
					dimension: basicFieldReferences[refPointName].dimension
				}
			}

			patternSetArray.push({
				pattern: moveSetArray,
				reference: reference
			});
		}


		// BUILD THE FINAL MOVESET
		var finalMoveSet = {};
		if ($('.finalMoveSetRow').find('.moveType').val() !== undefined) {
			var moveType = parseInt( $('.finalMoveSetRow').find('.moveType').val() );
			var stepSize = parseInt( $('.finalMoveSetRow').find('.stepSize').val() );
			var remainingCounts = totalCounts - usedCounts;
			finalMoveSet = {
				move: moveType,
				counts: remainingCounts,
				stepSize: stepSize
			}
		} else {
			// No final moveset. Let's makes something that won't break anything.
			finalMoveSet = {
				move: DP.MOVE.MT,
				counts: 0,
				stepSize: DP.STEP.STND
			}
		}

		var patternSet = {
			counts: totalCounts,
			patterns: patternSetArray,
			moveSet: finalMoveSet
		}

		// Are we trying to apply more counts than we can handle?
		if (currentCount + totalCounts > chartCounts) {
			alert('You are trying to apply more counts than there are in this chart based on the currently active count. Either add more counts to the chart in the Chart Settings, or move to an earlier active count.');
			dpEditor.clearActiveFeature();
			return false;
		} else {
			dpEditor.applyToPerformers(DP.LOGIC.APPLY_PATTERNSET.CODE, {
				patternSet: patternSet,
				chartId: chartId,
				countIdx: currentCount
			}, true);
		}
	}


	deleteRow(el) {
		el = $(el);
		el.parents('.moveSetRow')[0].remove();
		return false;
	}
	deletePattern(el) {
		el = $(el);
		el.parents('.patternRow')[0].remove();
		return false;
	}
	deleteReference(el, patternCount) {
		el = $(el);
		el.parents('.patternReference').empty();
		// Show the + Reference Point button for the correct pattern container
		$('#pattern_'+patternCount+'_addReference').show();
		return false;
	}
	deleteFinalInstruction() {
		$('#finalMoveSetContainer').empty();
		$('#finalMoveSetButton').show();
		return false;
	}

	addPattern() {
		var dpMovePerformer = this;
		var count = parseInt($('#patternCount').val()) + 1;

		var well = $('<div>', {'class': 'well patternRow'});
		var moveSetCount = $('<input>',{
			name: 'pattern_'+count+'_moveSetCount',
			id: 'pattern_'+count+'_moveSetCount',
			type: 'hidden',
			value: '0'
		}).appendTo(well);
		well.append($('<div>', {
			'id': 'pattern_'+count+'_moveSetContainer'
		}));
		well.append($('<div>', {
			'id': 'pattern_'+count+'_referenceContainer',
			'class': 'patternReference'
		}));

		var div = $('<div>', {
			'class': 'pattern-controls'
		}).appendTo(well);
		// + Instruction button
		var a = $('<a>', {
			'class': 'btn btn-primary',
			'css': {
				'margin-right' : '.5em'
			}
		}).on('click',function(){
			return dpMovePerformer.addInstruction(count);
		}).appendTo(div);
		a.append($('<span>', {
			'class': 'fa fa-plus'
		}));
		a.append(' Instruction');
		// + Reference button
		var a = $('<a>', {
			'id': 'pattern_'+count+'_addReference',
			'class': 'btn btn-success',
			'css': {
				'margin-right' : '.5em'
			}
		}).on('click',function(){
			return dpMovePerformer.addReference(count);
		}).appendTo(div);
		a.append($('<span>', {
			'class': 'fa fa-plus'
		}));
		a.append(' Reference Point');
		// Delete Pattern button
		a = $('<a>', {
			'class': 'btn btn-danger'
		}).on('click',function(){
			return dpMovePerformer.deletePattern(this);
		}).appendTo(div);
		a.append($('<span>', {
			'class': 'fa fa-trash'
		}));
		a.append(' Delete Pattern');
		
		$('#patternCount').val(count);
		$('#patternSetContainer').append(well);
	}

	addInstruction(patternCount) {
		var dpMovePerformer = this;
		var count = parseInt($('#pattern_'+patternCount+'_moveSetCount').val()) + 1;

		var row = $('<div>', {'class': 'row moveSetRow'});
		var col1 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col2 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col3 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col4 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var p = $('<p>');

		// Type of Movement (FM, BM, LT, RT, Obliques)
		$('<label>', {
			'for': 'pattern_'+patternCount+'moveType'+count,
			'text': 'Type of Movement'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<select>', {
			'id': 'pattern_'+patternCount+'moveType'+count,
			'class': 'moveType',
			'required': 'true',
			'message': 'Please select the movement type.'
		}).append($('<option>', {
			'value': DP.MOVE.FM,
			'text': 'Forward March (FM)'
		})).append($('<option>', {
			'value': DP.MOVE.BM,
			'text': 'Backward March (BM)'
		})).append($('<option>', {
			'value': DP.MOVE.LT,
			'text': 'Left Traverse (LT)'
		})).append($('<option>', {
			'value': DP.MOVE.RT,
			'text': 'Right Traverse (RT)'
		})).append($('<option>', {
			'value': DP.MOVE.MT,
			'text': 'Mark Time (MT)'
		})).append($('<option>', {
			'value': DP.OBLIQUE.FL,
			'text': 'Oblique Left'
		})).append($('<option>', {
			'value': DP.OBLIQUE.FR,
			'text': 'Oblique Right'
		})).append($('<option>', {
			'value': DP.OBLIQUE.BL,
			'text': 'Backward Oblique Left'
		})).append($('<option>', {
			'value': DP.OBLIQUE.BR,
			'text': 'Backward Oblique Right'
		})).appendTo(p);
		p.appendTo(col1);
		p = $('<p>');

		// Step Size (8-5, 16-5)
		$('<label>', {
			'for': 'pattern_'+patternCount+'stepSize'+count,
			'text': 'Step Size'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<select>', {
			'id': 'pattern_'+patternCount+'stepSize'+count,
			'class': 'stepSize',
			'required': 'true',
			'message': 'Please select the step size.'
		}).append($('<option>', {
			'value': DP.STEP.STND,
			'text': '8 to 5'
		})).append($('<option>', {
			'value': DP.STEP.HALF,
			'text': '16 to 5'
		})).appendTo(p);
		p.appendTo(col2);
		p = $('<p>');

		// Number of Counts
		$('<label>', {
			'for': 'pattern_'+patternCount+'counts'+count,
			'text': 'Number of Counts'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<input>', {
			'id': 'pattern_'+patternCount+'counts'+count,
			'class': 'counts',
			'type': 'number',
			'required': 'true',
			'message': 'Please enter a number of counts.'
		}).appendTo(p);
		p.appendTo(col3);
		// delete button
		p = $('<p>');
		p.append($('<br>'));
		var button = $('<button>',{
			'class': 'btn btn-danger',
		}).append($('<span>', {
			'class': 'fa fa-trash'
		})).on('click',function(){
			return dpMovePerformer.deleteRow(this);
		});
		p.append(button);
		p.appendTo(col4);

		$('#pattern_'+patternCount+'_moveSetCount').val(count);
		$('#pattern_'+patternCount+'_moveSetContainer').append(row);

		return false;
	}

	addReference(patternCount) {
		var dpMovePerformer = this;
		var referenceContainer = $('#pattern_'+patternCount+'_referenceContainer');
		referenceContainer.append($('<hr>'));
		var row = $('<div>', {'class': 'row'});
		var col1 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col2 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col3 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col4 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var p = $('<p>').appendTo(col1);

		// Reference Point
		$('<label>', {
			'for': 'pattern'+patternCount+'Point',
			'text': 'Reference Point'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		var select = $('<select>', {
			'id': 'pattern'+patternCount+'Point',
			'class': 'patternReferencePoint',
			'required': 'true',
			'message': 'Please select the reference point.'
		}).appendTo(p);

		var basicFieldReferences = DP.buildFieldReferenceObject();
		var optgroup = $('<optgroup>', {
			'label': 'Yard Lines'
		}).appendTo(select);

		// Yard Lines
		for (var i = 0; i < DP.FIELD_REFERENCE_ORDER.YARDLINE.length; i++) {
			var ydln = DP.FIELD_REFERENCE_ORDER.YARDLINE[i];
			optgroup.append($('<option>', {
				'value': ydln,
				'text': basicFieldReferences[ydln].text
			}));
		}
		// Side Lines
		optgroup = $('<optgroup>', {
			'label': 'Side Lines'
		}).appendTo(select);
		for (var i = 0; i < DP.FIELD_REFERENCE_ORDER.SIDELINE.length; i++) {
			var sdln = DP.FIELD_REFERENCE_ORDER.SIDELINE[i];
			optgroup.append($('<option>', {
				'value': sdln,
				'text': basicFieldReferences[sdln].text
			}));
		}

		// Hash Lines
		optgroup = $('<optgroup>', {
			'label': 'Hash Lines'
		}).appendTo(select);
		for (var i = 0; i < DP.FIELD_REFERENCE_ORDER.HASHLINE.length; i++) {
			var hashln = DP.FIELD_REFERENCE_ORDER.HASHLINE[i];
			optgroup.append($('<option>', {
				'value': hashln,
				'text': basicFieldReferences[hashln].text
			}));
		}
	
		p = $('<p>');
		p.append($('<br>'));
		var button = $('<button>',{
			'class': 'btn btn-danger',
		}).append($('<span>', {
			'class': 'fa fa-trash'
		})).on('click',function(){
			return dpMovePerformer.deleteReference(this, patternCount);
		});
		p.append(button);
		p.appendTo(col4);

		referenceContainer.append(row);

		// Hide the + Reference Point button for the patternCount
		 $('#pattern_'+patternCount+'_addReference').hide();


		return false;
	}

	addFinalInstruction() {
		var dpMovePerformer = this;
		var well = $('<div>', {'class': 'well'});
		well.append($('<h2>', {
			'text': 'Final Instruction'
		}));
		well.append($('<p>', {
			'text': 'This instruction will be applied after all patterns are completed for the remaining number of counts.'
		}));

		var row = $('<div>', {'class': 'row finalMoveSetRow'}).appendTo(well);
		var col1 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col2 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col3 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var col4 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
		var p = $('<p>');

		// Type of Movement (FM, BM, LT, RT, Obliques)
		$('<label>', {
			'for': 'finalMoveSetMoveType',
			'text': 'Type of Movement'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<select>', {
			'id': 'finalMoveSetMoveType',
			'class': 'moveType',
			'required': 'true',
			'message': 'Please select the movement type.'
		}).append($('<option>', {
			'value': DP.MOVE.FM,
			'text': 'Forward March (FM)'
		})).append($('<option>', {
			'value': DP.MOVE.BM,
			'text': 'Backward March (BM)'
		})).append($('<option>', {
			'value': DP.MOVE.LT,
			'text': 'Left Traverse (LT)'
		})).append($('<option>', {
			'value': DP.MOVE.RT,
			'text': 'Right Traverse (RT)'
		})).append($('<option>', {
			'value': DP.MOVE.MT,
			'text': 'Mark Time (MT)'
		})).append($('<option>', {
			'value': DP.OBLIQUE.FL,
			'text': 'Oblique Left'
		})).append($('<option>', {
			'value': DP.OBLIQUE.FR,
			'text': 'Oblique Right'
		})).append($('<option>', {
			'value': DP.OBLIQUE.BL,
			'text': 'Backward Oblique Left'
		})).append($('<option>', {
			'value': DP.OBLIQUE.BR,
			'text': 'Backward Oblique Right'
		})).appendTo(p);
		p.appendTo(col1);
		p = $('<p>');

		// Step Size (8-5, 16-5)
		$('<label>', {
			'for': 'finalMoveSetStepSize',
			'text': 'Step Size'
		}).append($('<span>',{
			'class': 'required',
			'text': '*'
		})).appendTo(p);
		$('<select>', {
			'id': 'finalMoveSetStepSize',
			'class': 'stepSize',
			'required': 'true',
			'message': 'Please select the step size.'
		}).append($('<option>', {
			'value': DP.STEP.STND,
			'text': '8 to 5'
		})).append($('<option>', {
			'value': DP.STEP.HALF,
			'text': '16 to 5'
		})).appendTo(p);
		p.appendTo(col2);
		p = $('<p>');

		// delete button
		p = $('<p>');
		p.append($('<br>'));
		var button = $('<button>',{
			'class': 'btn btn-danger',
		}).append($('<span>', {
			'class': 'fa fa-trash'
		})).on('click',function(){
			return dpMovePerformer.deleteFinalInstruction(this);
		});
		p.append(button);
		p.appendTo(col4);

		$('#finalMoveSetContainer').append(well);

		// hide the add final instruction button
		$('#finalMoveSetButton').hide();

		return false;
	}

}