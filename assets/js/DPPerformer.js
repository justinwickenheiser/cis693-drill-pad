class DPPerformer extends paper.PointText {
	// object properties
	performerId = null;
	drillNumber = {
		number: 0,
		angle: 270 // top
		// angle: 0 // right
		// angle: 90 // bottom
		// angle: 180 // left
	};
	drillNumberElement = null; // PaperJS Group

	constructor(obj) {
		super(obj);
		var dpPerformer = this;

		if (obj === undefined) {
			obj = {};
		}
		if (obj.performerId !== undefined) {
			dpPerformer.setPerformerId(obj.performerId);
		}
		if (obj.drillNumber === undefined) {
			obj.drillNumber = {};
		}
		if (obj.drillNumber.number !== undefined) {
			dpPerformer.setDrillNumber(obj.drillNumber.number);
		}

		dpPerformer.buildDrillNumberElement();
	}

	// PERFORMERID
	getPerformerId() {
		return this.performerId;
	}
	// the performerId (val) must be a string w/ a length > 0
	setPerformerId(val) {
		if(typeof(val) === 'string' && val.length > 0) {
			this.performerId = val;
			return true;
		}
		return false;
	}

	// DRILLNUMBER
	getDrillNumber() {
		return this.drillNumber;
	}
	// the drillNumber (val) must be a number w/ a value > 0
	setDrillNumber(val) {
		if(typeof(val) === 'number' && val > 0) {
			this.drillNumber.number = val;
			return true; 
		}
		return false;
	}
	buildDrillNumberElement() {
		var numPoint = new paper.Point({
			length: 15,
			angle: this.drillNumber.angle
		});
		var point = this.position.add(numPoint);
		var num = new paper.PointText({
			content: this.drillNumber.number,
			point: point,
			fillColor: 'black',
			fontFamily: 'Arial',
			fontSize: '8px',
			name: 'drillNumber'
		});
		num.position = point;

		var vector = num.position.subtract(this.position);
		var linePoint = new paper.Point({
			length: 10,
			angle: vector.angle
		});

		var line = new paper.Path({
			segments: [this.position, this.position.add(linePoint)],
			strokeColor: 'red',
			name: 'line'
		});

		this.drillNumberElement = new Group(num, line);
	}
	updateDrillNumberPosition() {
		var numPoint = new paper.Point({
			length: 15,
			angle: this.drillNumber.angle
		});

		var num = this.drillNumberElement.children.drillNumber;
		// update number position
		num.position = this.position.add(numPoint);
		// update line
		var vector = num.position.subtract(this.position);
		var linePoint = new paper.Point({
			length: 10,
			angle: vector.angle
		});

		var line = this.drillNumberElement.children.line;
		line.removeSegments();
		line.add(this.position);
		line.add(this.position.add(linePoint));
		this.bringToFront();

	}
}