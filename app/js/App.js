/**
 * This file contains logic related to the main application.
 */

function Application(options){
	_.extend(this, options || {});
}

_.extend(Application.prototype, {
	/**
	 * Setup and start the application.
	 */
	start: function (){
		this.setupStats();
		this.canvasView.initialize();
		this.sceneManager.initialize({
			canvasView: this.canvasView,
			stats: this.stats
		});

		// Begin playing the first scene.
		this.sceneManager.loadScene('train').play();
	},

	/**
	 * Setup Dat.GUI and stats.
	 */
	setupStats: function (){
		this.gui = new dat.GUI();
		this.stats = new Stats();
		$('body').append(this.stats.domElement);
	}
});


// Start the main application.
var app = new Application({
	canvasView: CanvasView,
	sceneManager: SceneManager
});
app.start();
