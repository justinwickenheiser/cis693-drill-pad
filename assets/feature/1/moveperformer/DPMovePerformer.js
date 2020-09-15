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

		var moveSetCount = $('<input>',{
			name: 'moveSetCount',
			id: 'moveSetCount',
			type: 'hidden',
			value: '0'
		}).appendTo(dom);

		dom.append($('<div>', {
			'id': 'moveSetContainer'
		}));

		var p = $('<p>').appendTo(dom);
		var a = $('<a>', {
			'class': 'btn btn-success'
		}).on('click',function(){
			return dpMovePerformer.addRow(1);
		}).appendTo(p);
		a.append($('<span>', {
			'class': 'fa fa-plus'
		}));
		a.append(' Instruction');

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
			nextChart = dpEditor.getDPChart(chartIdx+1),
			performers = dpEditor.getSelectedPerformers(),
			keys = Object.keys(performers),
			performer;

		// var instructionCount = parseInt($('#moveSetCount').val());
		var instructions = $('.moveSetRow');

		// build the moveSetArray
		var moveSetArray = [];
		var moveType,stepSize,counts;
		var totalCounts = 0;
		for (var i=0; i<instructions.length; i++) {
			moveType = parseInt( $( instructions[i] ).find('.moveType').val() );
			stepSize = parseInt( $( instructions[i] ).find('.stepSize').val() );
			counts = parseInt( $( instructions[i] ).find('.counts').val() );
			totalCounts += counts;

			moveSetArray.push({
				move: moveType,
				counts: counts,
				stepSize: stepSize
			});
		}

		// Are we trying to apply more counts than we can handle?
		if (currentCount + totalCounts > chartCounts) {
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


	deleteRow(el) {
		el = $(el);
		el.parents('.moveSetRow')[0].remove();
		return false;
	}

	addRow(num) {
		var dpMovePerformer = this;
		num = num || 1;
		for(var i=0;i<num;i++) {
			var count = parseInt($('#moveSetCount').val()) + 1;
			

			var row = $('<div>', {'class': 'row moveSetRow'});
			var col1 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
			var col2 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
			var col3 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
			var col4 = $('<div>', {'class': 'col-md-3'}).appendTo(row);
			var p = $('<p>');

			// Type of Movement (FM, BM, LT, RT, Obliques)
			$('<label>', {
				'for': 'moveType'+count,
				'text': 'Type of Movement'
			}).append($('<span>',{
				'class': 'required',
				'text': '*'
			})).appendTo(p);
			$('<select>', {
				'id': 'moveType'+count,
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
				'for': 'stepSize'+count,
				'text': 'Step Size'
			}).append($('<span>',{
				'class': 'required',
				'text': '*'
			})).appendTo(p);
			$('<select>', {
				'id': 'stepSize'+count,
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
				'for': 'counts'+count,
				'text': 'Number of Counts'
			}).append($('<span>',{
				'class': 'required',
				'text': '*'
			})).appendTo(p);
			$('<input>', {
				'id': 'counts'+count,
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

			$('#moveSetCount').val(count);
			$('#moveSetContainer').append(row);
		}

		return false;
	}

}