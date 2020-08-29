class DPChart {
	chartId = null;
	chartNumber = null;
	title = null;
	counts = null;
	activeCountIdx = null;
	dpEditor = null;
	
	constructor(obj, dpEditor) {
		var dpChart = this; // allows you to reference the chart object inside ajax calls

		if (obj === undefined) {
			obj = {};
		}
		if (obj.chartId !== undefined) {
			this.setChartId(obj.chartId);
		}
		if (obj.chartNumber !== undefined) {
			this.setChartNumber(obj.chartNumber);
		}
		if (obj.title !== undefined) {
			this.setTitle(obj.title);
		}
		if (obj.counts !== undefined) {
			this.setCounts(obj.counts);
		}
		if (obj.activeCountIdx !== undefined) {
			this.setActiveCountIdx(obj.activeCountIdx);
		}
		if (dpEditor !== undefined) {
			this.setDPEditor(dpEditor);
		}
	}

	// DPEDITOR
	setDPEditor(val) {
		if (val !== null && typeof(val) === 'object' && val.constructor === DPEditor) {
			this.dpEditor = val;
			return true;
		}
		return false;
	}

	// CHARTID

	getChartId() {
		return this.chartId;
	}

	// The chartId (val) must be a string w/ a length > 0
	setChartId(val) {
		if (typeof(val) === 'string' && val.length > 0) {
			this.chartId = val;
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

	// CHARTNUMBER

	getChartNumber() {
		return this.chartNumber;
	}

	// the chartNumber (val) must be a number with a length > 0
	setChartNumber(val) {
		if (typeof(val) === 'number') {
			this.chartNumber = val;
			return true;
		}
		return false;
	};

	// COUNTS

	getCounts() {
		return this.counts;
	}

	// the counts (val) must be a number. It can be 0 (because the last chart doesn't get counts because there is no next chart)
	setCounts(val) {
		if (typeof(val) === 'number') {
			this.counts = val;
			return true;
		}
		return false;
	};

	// ACTIVECHARTIDX
	setActiveCountIdx(idx) {
		if (idx !== null && typeof(idx) === 'number') {
			this.activeCountIdx = idx;
			return true;
		}
		return false;
	}
	getActiveCountIdx() {
		return this.activeCountIdx;
	}

}