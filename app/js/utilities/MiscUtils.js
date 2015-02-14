/**
 * This file defines several general-use, miscellaneous utility functions which
 * can be used in other script files.
 */

var Utils = {
	now: function (){
		return (performance && performance.now) ? performance.now() : Date.now();
	},

	randomRGB: function (){
		return {
			r: Math.floor(Math.random()*255),
			g: Math.floor(Math.random()*255),
			b: Math.floor(Math.random()*255)
		};
	},

	randomColor: function (){
		var r = Math.floor(Math.random()*255);
		var g = Math.floor(Math.random()*255);
		var b = Math.floor(Math.random()*255);

		return 'rgb('+r+','+g+','+b+')';
	},

	randomHex: function (){
		var color = this.randomRGB();

		return this.rgbToHex(color.r, color.g, color.b);
	},

	/**
	 * Converts RGB integers into Hex format.
	 */
	rgbToHex: function (r, g, b){
		var red = r.toString(16);
		var green = g.toString(16);
		var blue = b.toString(16);
		red = red == "0" ? "00" : red;
		green = green == "0" ? "00" : green;
		blue = blue == "0" ? "00" : blue;

		return parseInt(red+green+blue, 16);
	},

	randomName: function (){
		return Names.random();
	},

	/**
	 * Returns the object and index from the input array that is the closest to 
	 * the target value.  This will attempt binary search if the input array is
	 * sorted.
	 * 
	 * @param  {Array.Number} arr    	The input array.
	 * @param  {Number} target 			The target value to match.
	 * @param  {boolean} isSorted 		Whether the input array is sorted.
	 * 
	 * @return {Object}        			A result object containing the closest 
	 *                              	match and its index.
	 */
	getClosestMatch: function (arr, target, isSorted){
		isSorted = !!isSorted;
		var bestDiff = Infinity;
		var bestMatch = null;
		var candidate, diff, absDiff;

		if (arr.length === 0){
			return console.error('Tried to find a closest match using an empty input array.');
		} else if (arr.length === 1){
			return arr[0];
		}

		// Check whether or not we can try binary search.
		if (isSorted){
			var start = 0, end = arr.length-1;
			while (start <= end){
				var center = Math.floor((start+end)/2);
				candidate = arr[center];
				diff = candidate - target;
				absDiff = Math.abs(diff);

				// Try to update the best match.
				if (absDiff < bestDiff){
					bestDiff = absDiff;
					bestMatch = candidate;
				}

				// Update start/end bounds.
				if (diff > 0){
					end = center-1;
				} else if (diff < 0){
					start = center+1;
				} else {
					// We've found an exact match.
					bestDiff = diff;
					bestMatch = candidate;
					break;
				}
			}
		} else {
			for (var i=0; i<arr.length; i++){
				candidate = arr[i];
				diff = candidate - target;
				absDiff = Math.abs(diff);
				if (absDiff < bestDiff){
					bestDiff = absDiff;
					bestMatch = candidate;
				}
			}
		}

		return bestMatch;
	}
};
