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
	static ROTATE = {
		CW: 25,
		CCW: 26
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
		},
		APPLY_MOVESETARRAY: {
			CODE: 19,
			PARAMS: ['moveSetArray','chartId','countIdx']
		},
		APPLY_PATTERNSET: {
			CODE: 20,
			PARAMS: ['patternSet','chartId','countIdx']
		},
		UPDATE_INIT_POSITIONS: {
			CODE: 25,
			PARAMS: []
		},
		UPDATE_EDGE_POSITIONS: {
			CODE: 26,
			PARAMS: ['chartId']
		},
		BUILD_ANIMATION_SET: {
			CODE: 27,
			PARAMS: ['startingChartIdx', 'endingChartIdx']
		}
	};
	static FIELD_REFERENCE_ORDER = {
		YARDLINE: ['0_left','5_left','10_left','15_left','20_left','25_left','30_left','35_left','40_left','45_left','50_center','45_right','40_right','35_right','30_right','25_right','20_right','15_right','10_right','5_right','0_right'],
		SIDELINE: ['back_side_line','front_side_line'],
		HASHLINE: ['back_hash_50_center','front_hash_50_center']
	};
	static FNSET = {
		DRAW_POINT: 21,
		DRAW_CIRCLE: 22,
		DRAW_RECTANGLE: 23,
		DRAW_ARC: 24,
	};

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
			parent: rtnLayer,
			visible: false
		});
		for (var i = 0; i < 21; i++) {
			// Reference On Back Side Line
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, 0) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'back_sl_'+(5*i)+'_left' : ( i == 10 ?  'back_sl_50_center' : ( i%10 > 0 ? 'back_sl_' + ((5*i) - (10*(i%10))) + '_right' : 'back_sl_0_right' ) ) ),
			}) );

			// Reference On Back Hash
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, hashDist.back*4*pps) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'back_hash_'+(5*i)+'_left' : ( i == 10 ?  'back_hash_50_center' : ( i%10 > 0 ? 'back_hash_' + ((5*i) - (10*(i%10))) + '_right' : 'back_hash_0_right' ) ) ),
			}) );

			// Reference On Front Hash
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, hashDist.front*4*pps) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'front_hash_'+(5*i)+'_left' : ( i == 10 ?  'front_hash_50_center' : ( i%10 > 0 ? 'front_hash_' + ((5*i) - (10*(i%10))) + '_right' : 'front_hash_0_right' ) ) ),
			}) );

			// Reference On Front Side Line
			fieldReferences.addChild( new paper.Path.Circle({
				center: fieldOffset.add( new paper.Point(8*pps*i, 84*pps) ),
				radius: 3,
				strokeColor: 'purple',
				name: ( i < 10 ? 'front_sl_'+(5*i)+'_left' : ( i == 10 ?  'front_sl_50_center' : ( i%10 > 0 ? 'front_sl_' + ((5*i) - (10*(i%10))) + '_right' : 'front_sl_0_right' ) ) ),
			}) );

		}

		return rtnLayer;
	}

	// Takes a Paper <Point> object
	static getNextPosition(point, direction, offset, stepSize, pps, rotation) {
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
		if (rotation == undefined) {
			rotation = {
				pointOfRotation: null,
				degreesPerCount: 0,
			};
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
		} else if (direction === DP.ROTATE.CW) {
			// ROTATE CLOCKWISE
			var tempPath = new paper.Path.Circle({
				center: [point.x, point.y],
				radius: 2
			});
			tempPath.rotate((rotation.degreesPerCount*offset), rotation.pointOfRotation);
			rtnVal = [tempPath.position.x, tempPath.position.y];
			tempPath.remove();
		} else if (direction === DP.ROTATE.CCW) {
			// ROTATE COUNT-CLOCKWISE
			var tempPath = new paper.Path.Circle({
				center: [point.x, point.y],
				radius: 2
			});
			tempPath.rotate((-1*rotation.degreesPerCount*offset), rotation.pointOfRotation);
			rtnVal = [tempPath.position.x, tempPath.position.y];
			tempPath.remove();
		}

		// rtnVal has created as an [x, y] value. But return a Paper <Point>
		return new paper.Point(rtnVal);

	}

	static buildFieldReferenceObject() {
		var rtnVal = {};

		for (var i = 0; i < 21; i++) {
			if (i == 0) {
				rtnVal["0_left"] = {
					text: 'Left Goal Line',
					dimension: {
						x: true,
						y: false
					}
				};
			} else if (i < 10) {
				rtnVal[(5*i)+'_left'] = {
					text: 'Left ' + (5*i) + ' Yard Line',
					dimension: {
						x: true,
						y: false
					}
				};
			} else if (i == 10) {
				rtnVal["50_center"] = {
					text: '50 Yard Line',
					dimension: {
						x: true,
						y: false
					}
				};
			} else if (i < 20) {
				rtnVal[((5*i) - (10*(i%10))) + '_right'] = {
					text: 'Right ' + ((5*i) - (10*(i%10))) + ' Yard Line',
					dimension: {
						x: true,
						y: false
					}
				};
			} else if (i == 20) {
				rtnVal["0_right"] = {
					text: 'Right Goal Line',
					dimension: {
						x: true,
						y: false
					}
				};
			}
		}

		rtnVal['back_side_line'] = {
			text: 'Back Side Line',
			dimension: {
				x: false,
				y: true
			}
		};
		rtnVal['front_side_line'] = {
			text: 'Front Side Line',
			dimension: {
				x: false,
				y: true
			}
		};
		rtnVal['back_hash_50_center'] = {
			text: 'Back Hash Line',
			dimension: {
				x: false,
				y: true
			}
		};
		rtnVal['front_hash_50_center'] = {
			text: 'Front Hash Line',
			dimension: {
				x: false,
				y: true
			}
		};

		return rtnVal;
	}

	static getFnSet(desiredFnSet, obj) {
		if (obj === undefined) {
			obj = {};
		}
		if (obj.pps === undefined) {
			obj.pps = 5;
		}

		var rtnVal = {
			onMouseDown: null,
			onMouseDrag: null,
			onMouseUp: null
		}
		// Any path drawing might use this. It will automatically go to the activeLayer.
		var path;
		var center;
		var from, to, through;
		var layer = project.getItem({className: 'Layer', name: 'reference'});
		if (!layer) {
			layer = new paper.Layer({name: 'reference'});
		}

		switch (desiredFnSet) {
			case DP.FNSET.DRAW_POINT:
				// Draw a simple point (but to see it, it needs to be a tiny circle);
				rtnVal.onMouseDown = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by pps"
						center = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						center = event.point;
					}
					DP.createRefPoint(center, layer);
				}

				rtnVal.onMouseDrag = null;
				rtnVal.onMouseUp = null;
				break;
			case DP.FNSET.DRAW_CIRCLE:
				rtnVal.onMouseDown = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by pps"
						center = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						center = event.point;
					}
				}

				rtnVal.onMouseDrag = function(event) {
					// calculate the radius between center drag event.point
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by pps"
						to = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						to = event.point;
					}
					var vector = to.subtract(center).length;
					if (path != undefined) {
						path.remove();
					}
					path = new paper.Path.Circle({
						center: center,
						radius: vector,
						strokeColor: 'red',
						dashArray: [10, 10],
						parent: layer
					});
				}

				rtnVal.onMouseUp = function(event) {
					// calculate the radius between center drag event.point
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by pps"
						to = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						to = event.point;
					}
					var vector = to.subtract(center).length;
					if (path != undefined) {
						path.remove();
					}
					// path is temporary. it was removed. create one that is permanent
					var permanent = new paper.Path.Circle({
						center: center,
						radius: vector,
						strokeColor: 'red',
						dashArray: [10, 10],
						data: {className:'refCircle'},
						parent: layer,
						name: uuidv4()
					});
					permanent.onClick = function(event) {
						this.selected = !this.selected;
					}

					// handle if there are obj.numPoints
					if (obj.numPoints !== undefined && obj.numPoints > 0) {
						var offset = permanent.length / obj.numPoints;
						for (var i = 0; i < obj.numPoints; i++) {
							var point = permanent.getPointAt(offset * i);
							DP.createRefPoint(point, layer);
						}
					}
				};
				break;
			case DP.FNSET.DRAW_RECTANGLE:
				rtnVal.onMouseDown = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by obj.pps"
						from = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						from = event.point;
					}
				}

				rtnVal.onMouseDrag = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by obj.pps"
						to = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						to = event.point;
					}
					if (path != undefined) {
						path.remove();
					}
					path = new paper.Path.Rectangle({
						from: from,
						to: to,
						strokeColor: 'green',
						dashArray: [10, 10],
						parent: layer
					});
				}

				rtnVal.onMouseUp = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by obj.pps"
						to = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						to = event.point;
					}
					// path is undefined if there was no drag (simple click)
					if (path != undefined) {
						// let's set the From to be the topLeft * the To to bottomRight
						from = path.bounds.topLeft;
						to = path.bounds.bottomRight;
					}
					if (path != undefined) {
						path.remove();
					}
					// path is temporary. it was removed. create one that is permanent
					var permanent = new paper.Path.Rectangle({
						from: from,
						to: to,
						strokeColor: 'green',
						dashArray: [10, 10],
						data: {className:'refRectangle'},
						parent: layer,
						name: uuidv4()
					});
					permanent.onClick = function(event) {
						this.selected = !this.selected;
					}
					// handle if there are obj.numPoints
					if (obj.spacingLR !== undefined && obj.spacingLR > 0 && obj.spacingFB !== undefined && obj.spacingFB > 0) {
						// divid the length of the vertical line by the spacingFB * pps. Then add 1 for the initial row.
						var rows = Math.floor(from.subtract(new paper.Point(from.x, to.y)).length / (obj.spacingFB*obj.pps)) + 1;
						// divid the length of the horizontal line by the space * pps. Then add 1 for the initial column.
						var cols = Math.floor(from.subtract(new paper.Point(to.x, from.y)).length / (obj.spacingLR*obj.pps)) + 1;

						for (var r = 0; r < rows; r++) {
							for (var c = 0; c < cols; c++) {
								var point = new paper.Point([from.add([obj.spacingLR*c*obj.pps,obj.spacingFB*r*obj.pps]).x, from.add([obj.spacingLR*c*obj.pps,obj.spacingFB*r*obj.pps]).y]);
								DP.createRefPoint(point, layer);
							}
						}
					}
				}
				break;
			case DP.FNSET.DRAW_ARC:
				rtnVal.onMouseDown = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by obj.pps"
						from = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						from = event.point;
					}
				}

				rtnVal.onMouseDrag = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by obj.pps"
						to = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						to = event.point;
					}
					if (obj.through == undefined) {
						// default mid point of arc
						var vector = to.subtract(from).divide(2).subtract(25);
						through = from.add(vector);
					} else {
						through = obj.through;
					}
					if (path != undefined) {
						path.remove();
					}
					path = new paper.Path.Arc({
						from: from,
						through: through,
						to: to,
						strokeColor: 'blue',
						dashArray: [10, 5],
						parent: layer
					});
				}
				rtnVal.onMouseUp = function(event) {
					if (event.event.shiftKey) {
						// "snap to grid. i.e. round to something divisible by obj.pps"
						to = new paper.Point( [Math.round(event.point.x/obj.pps)*obj.pps, Math.round(event.point.y/obj.pps)*obj.pps] );
					} else {
						to = event.point;
					}
					if (obj.through == undefined) {
						// default mid point of arc
						var vector = to.subtract(from).divide(2).subtract(25);
						through = from.add(vector);
					} else {
						through = obj.through;
					}
					if (path != undefined) {
						path.remove();
					}

					// path is temporary. it was removed. create one that is permanent
					var permanent = new paper.Path.Arc({
						from: from,
						through: through,
						to: to,
						strokeColor: 'blue',
						dashArray: [10, 5],
						data: {className:'refArc'},
						parent: layer,
						name: uuidv4()
					});
					permanent.onClick = function(event) {
						this.selected = !this.selected;
					}

					// handle if there are obj.numPoints
					if (obj.numPoints !== undefined && obj.numPoints > 0) {
						if (obj.numPoints == 1) {
							var offset = permanent.length / obj.numPoints;
						} else {
							var offset = permanent.length / (obj.numPoints - 1);
						}
						
						for (var i = 0; i < obj.numPoints; i++) {
							var point = permanent.getPointAt(offset * i);
							DP.createRefPoint(point, layer);
						}
					}
				}
				break;
		}

		return rtnVal;
	}

	static createRefPoint(position, parent) {
		var pt = new paper.Path.Circle({
			center: position,
			radius: 3,
			strokeColor: 'purple',
			parent: parent,
			data: {className:'refPoint'},
			name: uuidv4()
		});
		pt.onClick = function(event) {
			this.selected = !this.selected;
		}
	}
}