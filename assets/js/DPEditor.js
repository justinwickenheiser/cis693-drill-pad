class DPEditor {
	ui = {
		'class': 'editor', // only used for css
		'id': null, // constructor will override this. id of html container
		'parent': null, //the DOM object of the parent of the editor id
		'canvas': {
			// parent
		},
		'chartHeader': {
			// parent
		},
		'toolbar': {
			// parent
		},
		'controls': {
			// parent,
		},
		'modal': {
			// the modal to house DPFeature getFormDom()
		}
	}
	title = null;
	editorId = null;
	dpFeature = [];
	dpFeatureKey = {};
	dpChart = [];
	dpPerformer = [];
	activeChartIdx = null;
	activeFeature = null;
	view = null; // This is the Paper Project's View Object
	settings = {
		'pps': 5
	}

	constructor(id, obj) {
		// Get Paper Set up initially
		paper.install(window);

		var dpEditor = this;

		if (obj === undefined) {
			obj = {
				settings: {}
			};
		}
		if (obj.settings === undefined) {
			obj.settings = {};
		}
		if (obj.settings.pps !== undefined) {
			dpEditor.settings.pps = obj.settings.pps;
		}
		if (obj.editorId !== undefined) {
			this.setEditorId(obj.editorId);
		}
		if (obj.title !== undefined) {
			this.setTitle(obj.title);
		}
		if (obj.dpChart !== undefined) {
			this.setDPCharts(obj.dpChart);
		}

		// ui.id
		dpEditor.ui.id = id;

		// ui.parent
		dpEditor.ui.parent = $(document.getElementById(dpEditor.ui.id));
		dpEditor.ui.parent.addClass(dpEditor.ui.class + '-container');

		// Prepare the modal
		(function () {
			// modal (root)
			dpEditor.ui.modal = $('<div>', {
				'class': 'modal hide modal-wide ' + dpEditor.ui.class + '-modal',
				'tabindex': -1,
				'role': 'dialog',
				'aria-hidden': true
			}).modal({
				'backdrop': 'static',
				'keyboard': true,
				'show': false
			}).bind('show.bs.modal', {}, function(event) {
				dpEditor.ui.modal.addClass('show');
				$('.' + dpEditor.ui.class + '-modal-header h3', this).empty().html($(this).data('header'));
				$('.' + dpEditor.ui.class + '-modal-body', this).empty().html($(this).data('content'));
				$('.' + dpEditor.ui.class + '-modal-footer .btn-primary', this).hide();
				if ($(this).data('showSave')) {
					$('.' + dpEditor.ui.class + '-modal-footer .btn-primary', this).show();
				}
			}).bind('shown.bs.modal', {}, function(event) {
				// Without this, we'll never be able to edit text fields in things like the Link dialog:
				// Credit (although I modified it to play nice) goes to Peter J. Hart via this link: http://stackoverflow.com/questions/14420300/bootstrap-with-ckeditor-equals-problems
				$(document).off('focusin.modal').bind('focusin.modal', {
					'modal': $(this)
				}, function (event) {});
				// focus on the first input element
				$('input, textarea, select', this).first().focus();
			}).bind('hidden.bs.modal', {}, function(event) {
				// remove all of the DOM from the modal when it closes so there are no references to the inputs
				$('.' + dpEditor.ui.class + '-modal-body', this).empty();
				// clear the data attached to the modal
				dpEditor.getUIModal().removeData();
			}).bind('hide.bs.modal', {}, function(event) {
				dpEditor.ui.modal.removeClass('show');
			});

			// // modal dialog
			// var modalDialog = $('<div>', {
			// 	'class': 'modal-dialog',
			// 	'role': 'document'
			// }).appendTo(dpEditor.ui.modal);

			// // modal content
			// var modalContent = $('<div>', {
			// 	'class': 'modal-content'
			// }).appendTo(modalDialog);


			// modal header
			$('<div>', {
				'class': 'modal-header ' + dpEditor.ui.class + '-modal-header'
			}).append($('<button>', {
				'class': 'close',
				'data-dismiss': 'modal',
				'aria-hidden': true,
				'html': '&times;'
			})).append($('<h3>', {
				'html': 'Loading...'
			})).appendTo(dpEditor.ui.modal);
			
			// modal body/content
			$('<div>', {
				'class': 'modal-body ' + dpEditor.ui.class + '-modal-body',
				'html': 'Loading...'
			}).appendTo(dpEditor.ui.modal);

			// footer
			$('<div>', {
				'class': 'modal-footer ' + dpEditor.ui.class + '-modal-footer'
			}).append($('<button>', {
				'class': 'btn',
				'data-dismiss': 'modal',
				'aria-hidden': true,
				'text': 'Close'
			})).append($('<button>', {
				'class': 'btn btn-primary',
				'data-dismiss': 'modal',
				'aria-hidden': true,
				'text': 'Save changes'
			}).bind('click', {}, function(event) {
				// this.showUIModal() sets up the data object on the DOM element returned by this.getUIModal(). Currently the variables are: wrapperIndex, wrapperChunkIndex, header, and content
				var feature = dpEditor.getUIModal().data('dpFeature');
				
				// If there is a feature, call that feature's saveFormDom
				if (feature !== null) {
					feature.saveFormDom(dpEditor);
				} else {
					console.log('** No DPFeature provided. Nothing to save. **')
				}

			})).appendTo(dpEditor.ui.modal);
		})();

		// Chart Header
		dpEditor.ui.chartHeader.parent = $('<div>', {
			'class': dpEditor.ui.class + '-chart-information'
		}).appendTo(dpEditor.ui.parent);
		// Chart settings container
		dpEditor.ui.chartHeader.settings = $('<div>', {
			'class': dpEditor.ui.class + '-chart-settings'
		}).appendTo(dpEditor.ui.chartHeader.parent);
		// Chart Controls (forward / backwards)
		dpEditor.ui.chartHeader.controls = $('<div>', {
			'class': dpEditor.ui.class + '-chart-controls'
		}).appendTo(dpEditor.ui.chartHeader.parent);
		// Count Controls (forward / backwards)
		dpEditor.ui.chartHeader.countControls = $('<div>', {
			'class': dpEditor.ui.class + '-chart-count-controls'
		}).appendTo(dpEditor.ui.chartHeader.parent);

		// previous chart
		$('<a>', {
			'class': 'btn btn-default',
			'html': '<span class="fa fa-chevron-left"></span>',
			'title': 'Previous Chart'
		}).bind('mouseup', {}, function(event) {
			var currentIdx = dpEditor.getActiveChartIdx();
			if (currentIdx > 0) {
				dpEditor.setActiveChartIdx(currentIdx-1);
				
				// update the UI by redrawing the editor
				dpEditor.redraw();
			} else {
				console.log('DEBUG: Currently on the first chart. There is no previous chart to move to.');
			}
		}).appendTo(dpEditor.ui.chartHeader.controls);
		// next chart
		$('<a>', {
			'class': 'btn btn-default',
			'html': '<span class="fa fa-chevron-right"></span>',
			'title': 'Next Chart'
		}).bind('mouseup', {}, function(event) {
			var currentIdx = dpEditor.getActiveChartIdx();
			if (currentIdx < dpEditor.getDPCharts().length-1) {
				dpEditor.setActiveChartIdx(currentIdx+1);
				
				// update the UI by redrawing the editor
				dpEditor.redraw();
			} else {
				console.log('DEBUG: Currently on the last chart. There is no next chart to move to.');
			}
		}).appendTo(dpEditor.ui.chartHeader.controls);

		dpEditor.ui.chartHeader.controls.append(document.createTextNode('Chart: '));
		// Chart Number
		$('<span>', {
			'id': 'chartNumber' 
		}).appendTo(dpEditor.ui.chartHeader.controls);

		// Previous Count
		$('<a>', {
			'class': 'btn btn-default',
			'html': '<span class="fa fa-chevron-left"></span>',
			'title': 'Previous Count'
		}).bind('mouseup', {}, function(event) {
			var currentChart = dpEditor.getDPChart( dpEditor.getActiveChartIdx() );
			var currentCountIdx = currentChart.getActiveCountIdx();
			if (currentCountIdx > 0) {
				currentChart.setActiveCountIdx(currentCountIdx-1);
				// update the UI by redrawing the editor
				dpEditor.redraw();
			} else {
				console.log('DEBUG: Currently on the initial count (0). There is no previous count to move to.');
			}
		}).appendTo(dpEditor.ui.chartHeader.countControls);
		// Next Count
		$('<a>', {
			'class': 'btn btn-default',
			'html': '<span class="fa fa-chevron-right"></span>',
			'title': 'Next Count'
		}).bind('mouseup', {}, function(event) {
			var currentChart = dpEditor.getDPChart( dpEditor.getActiveChartIdx() );
			var currentCountIdx = currentChart.getActiveCountIdx();
			if (currentCountIdx < currentChart.getCounts()) {
				currentChart.setActiveCountIdx(currentCountIdx+1);
				// update the UI by redrawing the editor
				dpEditor.redraw();
			} else {
				console.log('DEBUG: Currently on the last count. There is no next count to move to.');
			}
		}).appendTo(dpEditor.ui.chartHeader.countControls);

		dpEditor.ui.chartHeader.countControls.append(document.createTextNode('Count: '));
		// Count Number
		$('<span>', {
			'id': 'countNumber' 
		}).appendTo(dpEditor.ui.chartHeader.countControls);

		
		// Prepare the Canvas 
		dpEditor.ui.canvas.parent = $('<canvas>', {
			'class': dpEditor.ui.class + '-canvas',
			'id': 'canvas',
			'css': {
				'border': '1px solid rgb(179, 179, 179)', // just to sanity check position
			}
		}).attr('width', 980).attr('height', 550).mousewheel(function(event) {
			var canvasHeight = 550;
			var canvasWidth = 980;
			if (event.shiftKey) {
				view.center = PanZoom.changeCenter(
					view.center,
					event.deltaX,
					event.deltaY,
					event.deltaFactor,
					-canvasWidth/15,	// xMin
					canvasWidth, 	// xMax
					-canvasHeight/15, 	// yMin
					canvasHeight	// yMax
				);
				event.preventDefault()
			} else if (event.altKey) {
				// ZOOM
				var oldZoom = view.zoom;
				var mousePosition = new paper.Point(event.offsetX, event.offsetY);
				var [newZoom, offset] = PanZoom.changeZoom(oldZoom, event.deltaY, view.center, mousePosition, 1.05, 4, 0.25);
				view.zoom = newZoom;
				view.center = view.center.add(offset);
			}
		}).appendTo(dpEditor.ui.parent);
		//'width': '980', // This #px is set based on # lines * pps
		//'height': '550', // This #px is set based on # lines * pps

		// Controls Container
		dpEditor.ui.controls.parent = $('<div>', {
			'class': dpEditor.ui.class + '-controls'
		}).appendTo(dpEditor.ui.parent);

		// Prepare ui.toolbar
		
		dpEditor.ui.toolbar.parent = $('<div>', {
			'class': dpEditor.ui.class + '-toolbar'
		}).appendTo(dpEditor.ui.parent);

		// make the toolbar widget move with your scroll
		$(window).scroll( this.setToolbarOnScroll(dpEditor.ui) );
		
		var btnToolbar,
			btnGroup;

		btnToolbar = $('<div>', {
			'class': 'btn-toolbar'
		}).appendTo(dpEditor.ui.toolbar.parent);

		// New Chart Btn in an independent btnGroup
		btnGroup = $('<div>', {
			'class': 'btn-group'
		}).appendTo(btnToolbar);
		
		$('<a>', {
			'id': 'editorAddChartBtn',
			'class': 'btn btn-default',
			'html': '<span class="fa fa-plus"></span>',
			'title': 'Add Chart'
		}).bind('mouseup', {}, function(event) {
			dpEditor.addChart();
		}).appendTo(btnGroup);

		// Feature Buttons
		dpEditor.ui.toolbar.feature = $('<div>', {
			'class': 'btn-group btn-group-vertical'
		}).appendTo(btnToolbar);

		function fnLoad(obj, appendLocation) {
			$.ajax({
				'url': '/js/feature/1/' + obj.folder + '/' + obj.object + '.js',
				'async': false,
				'cache': false,
				'success': function(data, textStatus, xhr) {
				},
				'complete': function(xhr, textStatus) {
					var isDefined = false,
						dpFeatureClass,
						dpFeature;

					if (textStatus == 'success') {
						try {
							// create a the class (obj.object) in code by using eval on the entire code from the file
							dpFeatureClass = eval(`(${xhr.responseText})`); // give the class name an alias so we can reference it in code
							console.log(obj.object + ' loaded successfully');
							isDefined = true;
						} catch(e) {
							console.log(obj.object + ' error: ' + e.message);
						}
					} else {
						console.log(obj.object + ' error: ' + textStatus);
					}
					
					if (!isDefined) {
						dpFeatureClass = DPFeature; // DPFeature class exists because it is being included on the html page via a <script>
						console.log(obj.object + ' failed to load; using DPFeature instead');
					}

					dpFeature = new dpFeatureClass({
						'folder': obj.folder,
						'featureId': obj.featureId,
						'icon': obj.icon,
						'title': obj.title,
						'buttonSetting': obj.buttonSetting,
						'object': obj.object
					}, dpEditor);
					
					// Add the newly imported feature to an array of features belonging to this DPEditor.
					dpEditor.addFeature(dpFeature);

					// Add the btn to the toolbar for this feature.
					$('<a>', {
						'id': dpFeature.getFeatureId(),
						'class': 'btn btn-default',
						'html': '<span class="fa fa-' + dpFeature.getIcon() + '"></span>',
						'title': dpFeature.getTitle()
					}).on('click', function() {
						// set active feature
						dpEditor.setActiveFeature(dpFeature);

						// call the onclick function for the feature
						dpFeature.onclick();
					}).appendTo(appendLocation);

				}
			}); // END OF AJAX REQUEST
		}; // END OF FNLOAD()

		// Load the features
		// this should be stored in a DB, queried, and looped over the results vs. declaring a hardcoded variable.
		var tempFeatures = [
			{
				'folder': 'addperformer',
				'featureId': uuidv4(),
				'icon': 'user',
				'title': 'Add Performer',
				'buttonSetting': 'active',
				'object': 'DPAddPerformer'
			},
			{
				'folder': 'pointer',
				'featureId': uuidv4(),
				'icon': 'mouse-pointer',
				'title': 'Pointer',
				'buttonSetting': 'default',
				'object': 'DPPointer'
			},
			{
				'folder': 'resetpz',
				'featureId': uuidv4(),
				'icon': 'search',
				'title': 'Reset Zoom',
				'buttonSetting': 'default',
				'object': 'DPResetPZ'
			},
			{
				'folder': 'chartsettings',
				'featureId': uuidv4(),
				'icon': 'cog',
				'title': 'Chart Settings',
				'buttonSetting': 'default',
				'object': 'DPChartSettings'
			}
		];

		for (var i = 0; i < tempFeatures.length; i++) {
			if (tempFeatures[i].object !== 'DPChartSettings') {
				fnLoad(tempFeatures[i], dpEditor.ui.toolbar.feature);
			} else {
				// The DPChartSettings needs to be appended in a different area.
				fnLoad(tempFeatures[i], dpEditor.ui.chartHeader.settings);
			}
		}

		// Set Up PaperJS Project
		paper.setup('canvas');
		dpEditor.view = view;
		var field = DP.drawField(dpEditor.settings.pps);

		// prep some <Layers> in the project
		var referenceLayer = new paper.Layer({
			'name': 'reference'
		});
		var performerLayer = new paper.Layer({
			'name': 'performer'
		});
		performerLayer.activate(); // make activeLayer in project

		// Now add the 1st chart, because we always want at least 1 chart
		dpEditor.setDPChart(new DPChart({
			'chartId': uuidv4(),
			'chartNumber': dpEditor.dpChart.length + 1,
			'counts': 0,
			'activeCountIdx': 0
		}, dpEditor));

	} // END OF CONSTRUCTOR()

	// make the toolbar widget move with your scroll
	setToolbarOnScroll(ui) {
		var top = ui.toolbar.parent.offset().top - parseFloat(ui.toolbar.parent.css('marginTop').replace(/auto/, 0)),
			y = $(this).scrollTop();
		// this same +25 is used within the CSS to offset it from kissing the top when scrolling
		if (y + 25 >= top) { 
			ui.toolbar.parent.addClass('fixed');
		} else {
			ui.toolbar.parent.removeClass('fixed');
		}
	}
	// Add a DPFeature to an array of features belonging to this DPEditor (dpFeature[])
	addFeature(val) {
		if (val !== null && typeof(val) === 'object' && val instanceof DPFeature && this.dpFeatureKey[val.getFolder()] == null) {
			this.dpFeatureKey[val.getFolder()] = this.dpFeature.push(val) - 1;
			return true;
		}
		return false;
	};

	// ACTIVEFEATURE
	getActiveFeature() {
		return this.activeFeature;
	}
	setActiveFeature(val) {
		if (val !== null && typeof(val) === 'object' && (val instanceof DPFeature || val === DPFeature)) {
			// clear the current active feature first
			this.clearActiveFeature();

			// now set new active feaure
			this.activeFeature = val;
			// determine if the button needs to be highlighed.
			if (val.getButtonSetting() === 'active') {
				$( '#'+val.getFeatureId() ).removeClass('btn-default');
				$( '#'+val.getFeatureId() ).addClass('btn-primary');
			}

			return true;
		}
		return false;
	}
	clearActiveFeature() {
		if (this.activeFeature !== null) {
			// before clearing the active feature, we must first run any deselect() calls on the current active feature
			this.activeFeature.deselect();

			$( '#'+this.activeFeature.getFeatureId() ).addClass('btn-default');
			$( '#'+this.activeFeature.getFeatureId() ).removeClass('btn-primary');
		}
		this.activeFeature = null;
		return true;
	}

	// MODAL
	getUIModal() {
		return this.ui.modal;
	}
	showUIModal(dpFeat, header, content) {
		this.getUIModal().data({
			'dpFeature': dpFeat,
			'header': header,
			'content': content,
			'showSave': true
		}).modal('show');
		return true;
	}
	// currenty un-used
	hasUIModal() {
		return false;
	}

	// EDITORID
	getEditorId() {
		return this.editorId;
	}
	// The editorId (val) must be a string w/ a length > 0
	setEditorId(val) {
		if (typeof(val) === 'string' && val.length > 0) {
			this.editorId = val;
			return true;
		}
		return false;
	}

	// TITLE
	getTitle() {
		return this.title;
	}
	// the title (val) must be a string (can be null)
	setTitle(val) {
		if (typeof(val) === 'string') {
			this.title = val.trim();
			return true;
		}
		return false;
	};

	// DPCHARTS
	setDPCharts(obj, insert) {
		if (insert === undefined) {
			insert = false; // replace
		}
		if (Array.isArray(obj)) {
			var idx;
			for (idx = 0; idx < obj.length; idx++) {
				this.setDPChart(obj[idx], idx, insert);
			}
			return true;
		}
		return false;
	}
	setDPChart(val, idx, insert) {
		if (idx === undefined) {
			idx = this.dpChart.length;
		}
		if (insert === undefined) {
			insert = false; // replace
		}
		if (val !== null && typeof(val) === 'object' && val.constructor === DPChart) {
			if (idx >= 0 && idx <= this.dpChart.length) {
				if (insert || this.removeDPChart(idx)) {
					// Add the chart
					this.dpChart.splice(idx, 0, val);

					// Set the active chart
					this.setActiveChartIdx(idx);
					return true;
				}
			}
		}
		return false;
	}
	removeDPChart(idx) {
		if (idx >=0 && idx < this.dpChart.length) {
			this.dpChart.splice(idx, 1);
		}
		return true;
	}
	getDPCharts() {
		return this.dpChart;
	}
	getDPChart(idx) {
		return this.dpChart[idx];
	}

	// ACTIVECHARTIDX
	setActiveChartIdx(idx) {
		// When a chart becomes active, that chart's activeCountIdx is set to 0
		// Meaning the active count for that chart is the initial set
		if (idx !== null && typeof(idx) === 'number') {
			this.activeChartIdx = idx;
			this.dpChart[idx].setActiveCountIdx(0);
			return true;
		}
		return false;
	}
	getActiveChartIdx() {
		return this.activeChartIdx;
	}
	addChart() {
		var dpEditor = this;
		var newChartId = uuidv4();

		// Create a new chart
		var newChart = new DPChart({
			'chartId': newChartId,
			'chartNumber': dpEditor.dpChart.length + 1,
			'activeCountIdx': 0,
			'counts': 0
		}, dpEditor);

		// Add the new chart to the editor
		dpEditor.setDPChart(newChart);

		// Give every performer this new chart w/ 0 positions (1 -- initial position)
		dpEditor.applyToPerformers(DP.LOGIC.TRIM_POSITIONS.CODE, {
			chartId: newChartId,
			counts: 0
		});
		
		// call the chart settings feature
		$(dpEditor.ui.chartHeader.settings[0].children[0]).click();
	}

	// DPPERFORMERS
	setDPPerformers(obj) {
		if (Array.isArray(obj)) {
			this.dpPerformer = [];
			var idx;
			for (idx = 0; idx < obj.length; idx++) {
				this.setDPPerformer(obj[idx], idx);
			}
			return true;
		}
		return false;
	};
	setDPPerformer(val, idx, insert) {
		if (idx === undefined) {
			idx = this.dpPerformer.length;
		}
		if (insert === undefined) {
			insert = false; // replace
		}
		if (val !== null && typeof(val) === 'object' && val.constructor === DPPerformer) {
			if (idx >= 0 && idx <= this.dpPerformer.length) {
				if (insert || this.removeDPPerformer(idx)) {
					this.dpPerformer.splice(idx, 0, val);
					return true;
				}
			}
		}
		return false;
	}
	removeDPPerformer(idx) {
		if (idx >=0 && idx < this.dpPerformer.length) {
			this.dpPerformer.splice(idx, 1);
		}
		return true;
	}
	getDPPerformers() {
		return this.dpPerformer;
	}
	getDPPerformer(idx) {
		return this.dpPerformer[idx];
	}

	// There are likely to be many things that should happen to all performers or maybe all selected performers.
	// This method will loop over every performer (or selected performers only) and apply the logic based on the desired method
	applyToPerformers(method, obj, selectedOnly) {
		if (selectedOnly === undefined) {
			selectedOnly = false; // apply to all performers
		}

		var performers = this.getDPPerformers();
		for (i = 0; i < performers.length; i++) {
			var perf = performers[i];

			switch (method) {
				case DP.LOGIC.TRIM_POSITIONS.CODE:
					perf.trimPositionSet(obj.chartId, obj.counts);
					break;
				case DP.LOGIC.DRAW_POSITION.CODE:
					perf.position = perf.getPositionSet(obj.chartId, obj.countIdx);
					perf.updateDrillNumberPosition();
					break;
				default:
					throw "DPEditor.applyToPerformers: Invalid Method."
			}
		}
	}

	// Reset the View from PanZoom
	resetView() {
		this.view.zoom = 1;
		this.view.center = [this.view.size.width/2, this.view.size.height/2];
	}

	redraw() {
		if (this.dpChart.length) {
			var chartIdx = this.getActiveChartIdx();
			var dpChart = this.dpChart[chartIdx];
			var chartId = dpChart.getChartId();
			var countIdx = dpChart.getActiveCountIdx();

			// Set the Chart Header information
			document.getElementById('chartNumber').innerText = dpChart.getChartNumber().toString() + ' / ' + this.dpChart.length;
			document.getElementById('countNumber').innerText = countIdx.toString() + ' / ' + dpChart.getCounts().toString();

			// ====================================
			// For every performer in the editor, 
			// set their position to be the 
			// position for this (Chart,Count) 
			// from their lookup table
			// ====================================
			this.applyToPerformers(DP.LOGIC.DRAW_POSITION.CODE, {
				chartId: chartId,
				countIdx: countIdx
			});
		}
	}
}