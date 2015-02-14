/**
 * This file contains logic related to the canvas.
 */

var CanvasView = {
	w: null, h: null,
	camera: null,
	renderer: null,
	$el: $('#canvasContainer'),

	initialize: function (options){
		options = options || {};
		this.w = window.innerWidth;
		this.h = window.innerHeight;

		// Setup THREE renderer.
		this.setupRenderer();

		// On window resize.
		var onWindowResizeBound = this.onWindowResize.bind(this);
		window.addEventListener('resize', onWindowResizeBound, false);
	},

	render: function (scene, camera){
		this.renderer.render(scene, camera);
	},

	setupRenderer: function (){
		this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		// this.renderer.setClearColor(0xffffff);

		// Add canvas to page.
		this.$el.append(this.renderer.domElement);
	},

	onWindowResize: function(){
		var w = this.w, h = this.h;
		this.renderer.setSize(w, h);

		if (this.camera){
			this.camera.aspect = w/h;
			this.camera.updateProjectionMatrix();
		}
	}
};
