class DP {
	static MOVE = {
		FM: 0,
		BM: 1,
		LT: 2,
		RT: 3,
		FTL: 4,
		MT: 10,
	};
	static OBLIQUE = {
		FL: 11,
		FR: 12,
		BL: 13,
		BR: 14
	}
	static STEP = {
		STND: 5,
		HALF: 6,
		ADJ: 7,
	};
	static HASH = {
		COLLEGE: 8,
		HS: 9,
	};
	static LOGIC = {
		TRIM_POSITIONS: {
			CODE: 15,
			PARAMS: ['chartId','counts']
		},
		DRAW_POSITION: {
			CODE: 16,
			PARAMS: ['chartId','countIdx']
		},
		CLEAR_SELECTED: {
			CODE: 17,
			PARAMS: []
		},
		DRAG_PERFORMERS: {
			CODE: 18,
			PARAMS: ['delta','chartId','countIdx']
		}
	}

	// pps: Pixels per Step
	static drawField(pps, obj) {

		if (obj === undefined) {
			obj = {}
		}
		if (obj.layerName === undefined) {
			obj.layerName = "field"
		}
		if (obj.hash === undefined) {
			obj.hash = DP.HASH.COLLEGE;
		}

		var rtnLayer = new paper.Layer({
			name: obj.layerName
		});
		// College & Default
		var hashDist = {back: 8, front: 13};
		if (obj.hash == DP.HASH.HS) {
			hashDist.back = 7;
			hashDist.front = 14;
		}

		// The field diagram is 197 steps wide
		var fieldWidth = 197 * pps;
		// The field diagram is 111 steps tall
		var fieldHeight = 111 * pps;
		// Some Colors Definitions
		var colors = {
			ltBlue: 'rgba(155, 255, 254, 1)',
			ltGray: 'rgba(179, 179, 179, .8)',
		}

		var singleStep = new paper.Group({
			name: 'singleStep',
			parent: rtnLayer
		});
		// blue cols
		for (var i = 0; i <= 197; i++) {
			singleStep.addChild(new paper.Path.Line({
				from: new paper.Point(i*pps, 0),
				to: new paper.Point(i*pps, fieldHeight),
				strokeColor: colors.ltBlue
			}));
		}
		// blue rows
		for (var i = 0; i <= 111; i++) {
			singleStep.addChild(new paper.Path.Line({
				from: new paper.Point(0, i*pps),
				to: new paper.Point(fieldWidth, i*pps),
				strokeColor: colors.ltBlue
			}));
		}

		

		// ======================================================
		// 4 Step Lines (Gray)
		// 		* Vertical: Offset 2 steps from left & 13 steps from top & are 84 steps long
		// 		There are 49 vertical lines
		// 
		// 		* Horizontal: Offset 18 steps from left & 5 steps from top & are 160 steps long.
		// 		There are 26 horizontal lines.
		// ======================================================
		var fourSteps = new paper.Group({
			name: 'fourSteps',
			parent: rtnLayer
		});
		var vertLineOffset = new paper.Point(2*pps, 13*pps);
		var horzLineOffset = new paper.Point(18*pps, 5*pps);
		// Vertical gray lines
		for (var i = 0; i < 49; i++) {
			fourSteps.addChild(new paper.Path.Line({
				from: vertLineOffset.add( new paper.Point(4*pps*i, 0) ),
				to: vertLineOffset.add( new paper.Point(4*pps*i, 84*pps) ),
				strokeColor: colors.ltGray
			}));
		}
		// Horizontal gray lines 
		for (var i = 0; i < 26; i++) {
			fourSteps.addChild(new paper.Path.Line({
				from: horzLineOffset.add( new paper.Point(0, 4*pps*i) ),
				to: horzLineOffset.add( new paper.Point(160*pps, 4*pps*i) ),
				strokeColor: colors.ltGray
			}));
		}

		// ======================================================
		// Yard Lines / Goal Lines / Side Lines (Gray)
		// 		* Yard/Goal Lines: Offset 13 from top, 18 from left, w/ 8 steps between them
		// 		There are 21 yardlines/goal lines.
		//
		//		* Side Lines: Offset 13 from top, 18 from left, but w/ 84 steps between
		//		There are 2 side lines.
		// ======================================================
		var yardLines = new paper.Group({
			name: 'yardLines',
			parent: rtnLayer
		});
		// The fieldOffset is the Top-Left Point of the main field (corner of side line & goal line)
		var fieldOffset = new paper.Point(18*pps, 13*pps);
		// yardlines / goal lines
		for (var i = 0; i < 21; i++) {
			yardLines.addChild(new paper.Path.Line({
				from: fieldOffset.add( new paper.Point(8*pps*i, 0) ),
				to: fieldOffset.add( new paper.Point(8*pps*i, 84*pps) ),
				strokeColor: 'black',
				name: ( i < 10 ? (5*i)+'_left' : ( i == 10 ?  '50_center' : ( i%10 > 0 ? ((5*i) - (10*(i%10))) + '_right' : 0 + '_right' ) ) )
			}));
		}
		// side lines
		for (var i = 0; i < 2; i++) {
			yardLines.addChild(new paper.Path.Line({
				from: fieldOffset.add( new paper.Point(0, 84*pps*i) ),
				to: fieldOffset.add( new paper.Point(160*pps, 84*pps*i) ),
				strokeColor: 'black',
				name: (i == 0 ? 'back_side_line' : 'front_side_line')
			}));
		}

		// ======================================================
		// HASH MARKS: the hashes are set to College.
		// 		* Adjust the y-value in new Point(x, y): (# * pps)
		//		to allow for HS hashes
		//
		//		College: 
		// 			* Back Hash: Point(x, 8*4*pps) --> Point(x, 32*pps)
		// 			* Front Hash: Point(x, 13*4*pps) --> Point(x, 52*pps)
		//		HS:
		//			* Back Hash: Point(x, 7*4*pps) --> Point(x, 28*pps)
		//			* Front Hash: Point(x, 14*4*pps) --> Point(x, 56*pps)
		// ======================================================
		var hashLines = new paper.Group({
			name: 'hashLines',
			parent: rtnLayer
		});
		// back hash lines (calculated from the top side line)
		for (var i = 0; i < 21; i++) {
			hashLines.addChild(new paper.Path.Line({
				from: fieldOffset.add( new paper.Point((8*pps*i) - (2*pps),  hashDist.back*4*pps) ),
				to: fieldOffset.add( new paper.Point((8*pps*i) - (2*pps) + (4*pps), hashDist.back*4*pps) ),
				strokeColor: 'black'
			}));
		}

		// front hash lines (calculated from the top side line)
		for (var i = 0; i < 21; i++) {
			hashLines.addChild(new paper.Path.Line({
				from: fieldOffset.add( new paper.Point((8*pps*i) - (2*pps),  hashDist.front*4*pps) ),
				to: fieldOffset.add( new paper.Point((8*pps*i) - (2*pps) + (4*pps), hashDist.front*4*pps) ),
				strokeColor: 'black'
			}));
		}

		// ======================================================
		// Field Numbers
		// 		* Back Numbers start 11 steps from Back Side Line
		// 		to bottom of the numbers
		// 
		// 		* Front Numbers start 73 steps from Back Side Line
		// 		to bottom of the numbers
		// ======================================================
		var fieldNumbers = new paper.Group({
			name: 'fieldNumbers',
			parent: rtnLayer
		});
		// back sideline numbers
		for (var i = 0; i < 21; i++) {
			var numberText = new paper.PointText({
				content: ( i < 11 ? 5*i : ( i%10 > 0 ? ((5*i) - (10*(i%10))) : 0 ) ),
				fillColor: 'black',
				fontFamily: 'Arial',
				fontSize: 4*pps,
				rotation: 180,
			});
			numberText.point = fieldOffset.add( new paper.Point((8*pps*i) + (numberText.bounds.width/2),  11*pps) );
			fieldNumbers.addChild( numberText );
		}

		// front sideline numbers
		for (var i = 0; i < 21; i++) {
			var numberText = new paper.PointText({
				content: ( i < 11 ? 5*i : ( i%10 > 0 ? ((5*i) - (10*(i%10))) : 0 ) ),
				fillColor: 'black',
				fontFamily: 'Arial',
				fontSize: 4*pps,
			});
			numberText.point = fieldOffset.add( new paper.Point((8*pps*i) - (numberText.bounds.width/2),  73*pps) );
			fieldNumbers.addChild( numberText );
		}


		// ======================================================
		// Reference Points
		//		These will be a group in the field layer that houses important points 
		//		that can be used for easier offset vector arithmatic.
		//
		//		For every yardline (including goal lines), get the point that interesects
		//		the Back Side Line, Back Hash, Front Hash, Front Side Line
		//
		//		Don't need to do the center, because Each yard line (Path.Line) has a .position which is the center
		// ======================================================
		var fieldReferences = new paper.Group({
			name: 'fieldReferences',
			parent: rtnLayer
		});
		for (var i = 0; i < 21; i++) {
			// Reference On Back Side Line
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, 0) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'back_sl_'+(5*i)+'_left' : ( i == 10 ?  'back_sl_50_center' : ( i%10 > 0 ? 'back_sl_' + ((5*i) - (10*(i%10))) + '_right' : 'back_sl_0_right' ) ) ),
				visible: false,
			}) );

			// Reference On Back Hash
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, hashDist.back*4*pps) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'back_hash_'+(5*i)+'_left' : ( i == 10 ?  'back_hash_50_center' : ( i%10 > 0 ? 'back_hash_' + ((5*i) - (10*(i%10))) + '_right' : 'back_hash_0_right' ) ) ),
				visible: false,
			}) );

			// Reference On Front Hash
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, hashDist.front*4*pps) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'front_hash_'+(5*i)+'_left' : ( i == 10 ?  'front_hash_50_center' : ( i%10 > 0 ? 'front_hash_' + ((5*i) - (10*(i%10))) + '_right' : 'front_hash_0_right' ) ) ),
				visible: false,
			}) );

			// Reference On Front Side Line
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, 84*pps) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'front_sl_'+(5*i)+'_left' : ( i == 10 ?  'front_sl_50_center' : ( i%10 > 0 ? 'front_sl_' + ((5*i) - (10*(i%10))) + '_right' : 'front_sl_0_right' ) ) ),
				visible: false,
			}) );

		}

		return rtnLayer;
	}

	// Takes a Paper <Point> object
	static getNextPosition(point, direction, offset, stepSize, pps) {
		if (direction == undefined) {
			direction = DP.MOVE.MT;
		}
		if (offset == undefined) {
			offset = 1;
		}
		if (stepSize == undefined) {
			stepSize = DP.STEP.STND;
		}
		if (pps == undefined) {
			pps = 5;
		}

		var rtnVal;
		if (direction == DP.MOVE.FM) {
			if (stepSize === DP.STEP.STND) {
				rtnVal = [point.x, point.y + (offset * pps)];
			} else if (stepSize === DP.STEP.HALF) {
				// 16-5 is half a regular step.
				rtnVal = [point.x, point.y + ((offset * pps)/2)];
			}
		} else if (direction === DP.MOVE.BM) {
			if (stepSize === DP.STEP.STND) {
				rtnVal = [point.x, point.y - (offset * pps)];
			} else if (stepSize === DP.STEP.HALF) {
				// 16-5 is half a regular step.
				rtnVal = [point.x, point.y - ((offset * pps)/2)];
			}
		} else if (direction === DP.MOVE.LT) {
			if (stepSize === DP.STEP.STND) {
				rtnVal = [point.x + (offset * pps), point.y];
			} else if (stepSize === DP.STEP.HALF) {
				// 16-5 is half a regular step.
				rtnVal = [point.x + ((offset * pps)/2), point.y ];
			}
		} else if (direction === DP.MOVE.RT) {
			if (stepSize === DP.STEP.STND) {
				rtnVal = [point.x - (offset * pps), point.y];
			} else if (stepSize === DP.STEP.HALF) {
				// 16-5 is half a regular step.
				rtnVal = [point.x - ((offset * pps)/2), point.y ];
			}
		} else if (direction === DP.MOVE.MT) {
			rtnVal = [point.x, point.y];
		} else if (direction === DP.OBLIQUE.FL) {
			// FL = Towards South East corner (+x, +y)
			rtnVal = [point.x + (offset * pps), point.y + (offset * pps)];
		} else if (direction === DP.OBLIQUE.FR) {
			// FR = Towards South West corner (-x, +y)
			rtnVal = [point.x - (offset * pps), point.y + (offset * pps)];
		} else if (direction === DP.OBLIQUE.BL) {
			// BL = Towards North East corner (+x, -y)
			rtnVal = [point.x + (offset * pps), point.y - (offset * pps)];
		} else if (direction === DP.OBLIQUE.BR) {
			// BR = Towards North West corner (-x, -y)
			rtnVal = [point.x - (offset * pps), point.y - (offset * pps)];
		}

		// rtnVal has created as an [x, y] value. But return a Paper <Point>
		return new paper.Point(rtnVal);

	}
}