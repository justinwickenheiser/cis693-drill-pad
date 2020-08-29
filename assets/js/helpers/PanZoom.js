// Reference: https://matthiasberth.com/tech/stable-zoom-and-pan-in-paperjs#StableZoom
class PanZoom {
	static changeZoom(oldZoom, delta, center, pt, factor, inLimit, outLimit) {
		var newPt, beta, newZoom, pc;
		newZoom;
		if (factor == undefined) {
			factor = 1.05;
		}
		if (delta < 0) {
			if (inLimit != undefined) {
				newZoom = Math.min(inLimit, oldZoom * factor);
			} else {
				newZoom = oldZoom * factor;
			}
		} else if (delta > 0) {
			if (inLimit != undefined) {
				newZoom = Math.max(outLimit, oldZoom / factor);
			} else {
				newZoom = oldZoom / factor;
			}
		} else {
			newZoom = oldZoom
		}

		beta = oldZoom / newZoom;
		pc = pt.subtract(center);
		newPt = pt.subtract(pc.multiply(beta)).subtract(center);
		return [newZoom, newPt];
	}

	static changeCenter(oldCenter, deltaX, deltaY, factor, xMin, xMax, yMin, yMax) {
		var offset = new paper.Point(deltaX, -deltaY);
		offset = offset.multiply(factor);
		var newCenter = oldCenter.add(offset);

		if (xMin != undefined) {
			newCenter.x = Math.max(xMin, newCenter.x);
		}
		if (xMax != undefined) {
			newCenter.x = Math.min(xMax, newCenter.x);
		}
		if (yMin != undefined) {
			newCenter.y = Math.max(yMin, newCenter.y);
		}
		if (yMax != undefined) {
			newCenter.y = Math.min(yMax, newCenter.y);
		}
		return newCenter;
	}
}