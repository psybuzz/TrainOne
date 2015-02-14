/**
 * This file contains a Scene interface.
 */

function Scene(){
	/**
	 * The THREE scene to be rendered.
	 * @type {THREE.Scene}
	 */
	this.THREEScene = null;

	/**
	 * The THREE camera to use.
	 * @type {THREE.Camera}
	 */
	this.camera = null;
}

/**
 * The callback to be run when the scene is loaded.
 */
Scene.prototype.open = function(){};

/**
 * The update function to be called each animation cycle.
 */
Scene.prototype.update = function(){};
