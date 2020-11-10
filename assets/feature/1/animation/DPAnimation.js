class DPAnimation extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		dpEditor.ui.controls.parent.empty();
		this.setControlDom();
	}
	
	deselect() {
		// Stop the animation
		dpEditor.animation.active = false;
		dpEditor.ui.controls.parent.empty(); // clear the control panel
		// Redraw the editor so if the animation is stopped at a random count
		// or betweens counts, it will redraw to the active chart
		dpEditor.redraw();
	}

	setControlDom() {
		var dpAnimation = this;
		var row, col, p;
		row = $('<div>', {'class': 'row'}).appendTo(dpEditor.ui.controls.parent);
		// Starting Chart Select
		col = $('<div>', {'class': 'col-md-2'}).appendTo(row);
		p = $('<p>').appendTo(col);
		$('<label>', {
			'for': dpEditor.ui.class + '-animation-starting-chart',
			'text': 'Starting Chart'
		}).appendTo(p);
		$('<select>', {
			'id': dpEditor.ui.class + '-animation-starting-chart'
		}).bind('change', {}, function(event) {
			dpAnimation.setAnimationControls();
		}).appendTo(p);

		// Speed Controls
		col = $('<div>', {'class': 'col-md-2'}).appendTo(row);
		p = $('<p>', {
			css: {
				'margin-bottom': '0',
			}
		}).appendTo(col);
		$('<label>', {
			'text': 'Speed Controls'
		}).appendTo(p);
		var btnGroup = $('<div>', {
			'class': 'btn-group'
		}).appendTo(col);
		$('<a>', {
			'id': 'animation-speed-dec',
			'class': 'btn btn-default',
			'html': '<span class="fa fa-minus"></span>',
			'title': 'Decrease Speed'
		}).bind('mouseup', {}, function(event) {
			// Decreasing speed means increasing the number of framesPerCount
			dpEditor.animation.framesPerCount += 1;
		}).appendTo(btnGroup);
		$('<a>', {
			'id': 'animation-speed-inc',
			'class': 'btn btn-default',
			'html': '<span class="fa fa-plus"></span>',
			'title': 'Increase Speed'
		}).bind('mouseup', {}, function(event) {
			// Increasing speed means reducing the number of framesPerCount
			dpEditor.animation.framesPerCount = Math.max(1, dpEditor.animation.framesPerCount-1);
		}).appendTo(btnGroup);
		
		// Play Button
		col = $('<div>', {'class': 'col-md-6'}).appendTo(row);
		p = $('<p>', {
			css: {
				'text-align': 'center',
			}
		}).appendTo(col);
		$('<label>', {
			'text': 'Play/Pause'
		}).appendTo(p);
		$('<a>', {
			'id': 'animation-play',
			'class': 'btn btn-default',
			'html': '<span class="fa fa-play"></span>',
			'title': 'Play'
		}).bind('mouseup', {}, function(event) {
			dpEditor.animation.active = true;
			$(this).hide();
			$('#animation-pause').show();
		}).appendTo(p);
		$('<a>', {
			'id': 'animation-pause',
			'class': 'btn btn-default',
			'html': '<span class="fa fa-pause"></span>',
			'title': 'Pause',
			'css': {
				'display': 'none',
			}
		}).bind('mouseup', {}, function(event) {
			dpEditor.animation.active = false;
			$(this).hide();
			$('#animation-play').show();
		}).appendTo(p);

		// Ending Chart Select
		col = $('<div>', {'class': 'col-md-2'}).appendTo(row);
		p = $('<p>').appendTo(col);
		$('<label>', {
			'for': dpEditor.ui.class + '-animation-ending-chart',
			'text': 'Ending Chart'
		}).appendTo(p);
		$('<select>', {
			'id': dpEditor.ui.class + '-animation-ending-chart'
		}).bind('change', {}, function(event) {
			dpAnimation.setAnimationControls();
		}).appendTo(p);

		dpAnimation.buildAnimationControls();
		dpAnimation.setAnimationControls();
	}

	setAnimationControls() {
		dpEditor.applyToPerformers(DP.LOGIC.BUILD_ANIMATION_SET.CODE, {
			startingChartIdx: parseInt($('#'+dpEditor.ui.class + '-animation-starting-chart').val()),
			endingChartIdx: parseInt($('#'+dpEditor.ui.class + '-animation-ending-chart').val())
		});
		// now set how many counts there are in the animation.
		// theoretically all performers should have the same number of counts in their animationPositionSet
		if (dpEditor.getDPPerformers().length) {
			dpEditor.animation.countMaxCount = dpEditor.getDPPerformers()[0].getAnimationPositionSet().length;
		} else {
			dpEditor.animation.countMaxCount = 0;
		}
	}

	buildAnimationControls() {
		var startingChart = $('#'+dpEditor.ui.class + '-animation-starting-chart');
		var endingChart = $('#'+dpEditor.ui.class + '-animation-ending-chart');
		$(startingChart).empty();
		$(endingChart).empty();
		var chart;
		// starting & ending charts
		for (var i = 0; i < dpEditor.dpChart.length; i++) {
			chart = dpEditor.getDPChart(i);
			$('<option>', {
				'value': i,
				'text': 'Chart ' + chart.getChartNumber().toString()
			}).appendTo(startingChart);
			$('<option>', {
				'value': i,
				'text': 'Chart ' + chart.getChartNumber().toString()
			}).appendTo(endingChart);
		}
	}

	
}