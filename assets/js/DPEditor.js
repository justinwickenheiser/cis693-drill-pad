class DPEditor {
	ui = {
		'class': 'editor', // only used for css
		'id': null, // constructor will override this. id of html container
		'parent': null, //the DOM object of the parent of the editor id
		'canvas': {
			// parent
		},
		'toolbar': {
			// parent
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

		// Set Up PaperJS Project
		paper.setup('canvas');
		dpEditor.view = view;

		
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
	}
}