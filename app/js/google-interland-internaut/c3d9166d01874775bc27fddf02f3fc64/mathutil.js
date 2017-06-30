export default {
	normalize: (val, min, max) => {
		 return (val-min)/(max-min);
	},
	interpolate: (value, minimum, maximum) => {
		return minimum + (maximum - minimum) * value;
	},
	limit: (value, min, max) => {
		return Math.min(Math.max(min, value), max)
	},
	limitInt: (value, min, max) => {
		return Math.round(Math.min(Math.max(min, value), max))
	},
	dist: (x1, y1, x2 ,y2) => {
		return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
	}
}
