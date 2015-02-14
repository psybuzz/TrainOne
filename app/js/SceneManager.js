/**
 * This file contains a module for managing scenes.
 */

var SceneManager = {
	currScene: null,
	isPlaying: false,
	lastTime: Date.now(),

	initialize: function (options){
		options = options || {};
		this.canvasView = options.canvasView;
		this.stats = options.stats;

		// Define a set of scenes.
		this.scenes = {
			'train': new TrainScene()
		};

		// Bind functions.
		this.animateBound = this.animate.bind(this);
	},

	play: function (){
		if (this.isPlaying) return;

		this.isPlaying = true;
		this.animateBound();
	},

	pause: function (){
		if (!this.isPlaying) return;	

		this.isPlaying = false;
	},

	animate: function (time){
		this.stats.begin();
		var delta = time - this.lastTime;
		this.lastTime = time;

		// Update the current scene.
		if (this.currScene){
			this.currScene.update(time, delta);
		}
		TWEEN.update(time);

		// Render.
		this.canvasView.render(this.currScene.THREEScene, this.currScene.camera);

		this.stats.end();
		if (this.isPlaying) requestAnimationFrame(this.animateBound);
	},

	loadScene: function (sceneName){
		var scene = this.scenes[sceneName];
		
		// Check that the requested scene is valid and different.
		if (!scene) return console.error('Tried to load an unknown scene.');
		if (scene === this.currScene) return;

		// Notify the current scene to transition out.
		if (this.currScene){
			this.currScene.close();
		}

		// Set and open the current scene.
		this.currScene = scene;
		this.canvasView.camera = scene.camera;
		this.canvasView.onWindowResize();
		scene.open();

		return this;
	}
};
