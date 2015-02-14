/**
 * This file contains logic for input control.  For example, a Keyboard module
 * controls behavior related to keypresses.
 *
 * A super-basic lightweight subscription model allows other objects to listen 
 * for keypress events.
 *
 * Sources
 * Keyboard Input helper
 * - http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
 */

/**
 * Keyboard module.
 */
var Key = {
	pressed: {},

	keycodeMap: {
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		W: 87,
		A: 65,
		S: 83,
		D: 68,
		Q: 81,
		E: 69,
		ENTER: 13,
		SPACE: 32,
		ESC: 27
	},

	eventCallbacks: {
		'keydown': [],
		'keyup': []
	},

	isDown: function(keyCode){
		return this.pressed[keyCode];
	},

	anyDown: function(){
		var p = this.pressed;
		var map = this.keycodeMap;
		var keys = Object.keys(map);
		for (var i=0; i<keys.length; i++){
			if (p[map[keys[i]]] === true){
				return true;
			}
		}

		return false;
	},

	onKeyDown: function(e){
		this.pressed[e.keyCode] = true;
	},

	onKeyUp: function(e){
		this.pressed[e.keyCode] = undefined;
	},

	matches: function (keyCode, keys){
		for (var i=0; i<keys.length; i++){
			var key = keys[i];

			// Check if the key matches.
			if (keyCode === this.keycodeMap[key]){
				return true;
			}
		}

		// Return false if there is no match.
		return false;
	},

	isPressed: function (keys){
		for (var i=0; i<keys.length; i++){
			var key = keys[i];

			// Check if the key is valid.
			if (!this.keycodeMap[key]){
				console.error('Key not found');
				return;
			}

			// Return true if the key is pressed.
			if (this.pressed[this.keycodeMap[key]] === true){
				return true;
			}
		}

		// Return false by default if none of the keys were pressed.
		return false;
	},

	listenTo: function (evt, callback){
		var evtArray = this.eventCallbacks[evt];
		if (!evtArray) console.error('Tried to subscribe to an unknown keyboard event.');
		
		evtArray.push(callback);
	}
};


// Bind keypress events.
document.body.onkeydown = function (e){
	Key.onKeyDown(e);
	Key.eventCallbacks['keydown'].map(function (cb){
		cb(e);
	})
};

document.body.onkeyup = function(e){
	Key.onKeyUp(e);
	Key.eventCallbacks['keyup'].map(function (cb){
		cb(e);
	})
	// document.documentElement.webkitRequestFullscreen()
};
