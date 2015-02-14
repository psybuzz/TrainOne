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

/**
 * This file defines a 3D buildings model.
 */

function BuildingsModel (options){
	options = options || {};
	var numBuildings = options.numBuildings || 50;
	var material = new THREE.MeshBasicMaterial({color: new THREE.Color('lightblue')});

	// var buildings = [];
	var result = new THREE.Group();
	var building_geo, building_mesh;
	var spacing = 10;
	for (var i=0; i<numBuildings; i++){
		building_geo = new THREE.BoxGeometry(
				Math.random()*5+2.5,
				Math.random()*15+16,
				Math.random()*2+3);
		building_mesh = new THREE.Mesh(building_geo, material);
		building_mesh.position.set(
				spacing*Math.random()+i*spacing - numBuildings*spacing/2 - spacing/2,
				-2,
				0);

		result.add(building_mesh);
	}

	return result;
}

/**
 * This file defines a 3D ground model.
 */

function GroundModel (options){
	options = options || {};
	var length = this.length = options.platformLength || 700;
	this.feetLevel = options.feetLevel || -4.1;
	this.platformHeight = options.platformHeight || 3;

	var floor_mat = new THREE.MeshBasicMaterial({color: 0xF0ECDF});
	var floor_mat = new THREE.MeshBasicMaterial({color: 0xBFBDB2});
	var dark_floor_mat = new THREE.MeshBasicMaterial({color: 0xBFBDB2});
	var dark_floor_mat = new THREE.MeshBasicMaterial({color: 0xA3A198});
	var caution_mat = new THREE.MeshPhongMaterial({color: 'yellow', ambient: 'yellow'});

	var platform_geo = new THREE.BoxGeometry(length, this.platformHeight, 30);
	var platform1 = new THREE.Mesh(platform_geo, floor_mat);
	var platform2 = new THREE.Mesh(platform_geo, floor_mat);
	platform1.position.set(0, this.feetLevel, 18);
	platform2.position.set(0, this.feetLevel, -18);

	// Build floor below railroad tracks.
	var floor_geo = new THREE.PlaneBufferGeometry(length, 7);
	var tracks_floor = new THREE.Mesh(floor_geo, dark_floor_mat);
	tracks_floor.rotateX(-Math.PI/2);
	tracks_floor.position.set(0, -4.8, 0);

	// Build caution lines.
	var caution_geo = new THREE.PlaneBufferGeometry(length, 1);
	var caution_line = new THREE.Mesh(caution_geo, caution_mat);
	caution_line.rotateX(-Math.PI/2);
	caution_line.position.set(0, 0.01+this.feetLevel+this.platformHeight/2, -3);

	var caution_line2 = new THREE.Mesh(caution_geo, caution_mat);
	caution_line2.rotateX(-Math.PI/2);
	caution_line2.position.set(0, 0.01+this.feetLevel+this.platformHeight/2, 3);

	var result = new THREE.Group();
	result.add(platform1, platform2, tracks_floor, caution_line, caution_line2);
	return result;
}

/**
 * This file defines a 3D person model.
 */

function PersonModel (options){
	options = options || {};
	var level = options.divisionLevel || 20;
	var scale = options.scale || 1;

	// Create hair.
	var hair_mesh = new HairModel({
		divisionLevel: level,
		outerRadius: scale*0.4,
		innerRadius: scale*0.28,
		arcHair: false,
		hairHeight: scale*0.28
	});

	// Create head.
	var head_mesh = new HeadModel({
		divisionLevel: level,
		radius: scale*0.35
	});
	head_mesh.position.y -= 0.05*scale;

	// Create body.
	var body_mesh = new BodyModel({
		radius: scale*0.4,
		height: scale*4
	});
	body_mesh.position.y -= 0.9*scale;

	// Assemble meshes together.
	var result_mesh = new THREE.Group();
	result_mesh.add(hair_mesh, head_mesh, body_mesh);

	return result_mesh;
}

function BodyModel (options){
	options = options || {};
	var radius = options.radius || 1;
	var height = options.height || 1.4;

	var result_mesh = new RoundPipeModel({
		radius: radius,
		height: height
	});

	return result_mesh;
}

function HairModel (options){
	options = options || {};
	var divisionLevel = options.divisionLevel || 20;
	var outerRadius = options.outerRadius || 0.4;
	var innerRadius = options.innerRadius || 0.28;
	var arcHair = options.arcHair || false;
	var hairHeight = options.hairHeight || 0.11;

	var outerHair_mesh = new RoundPipeModel({
		divisionLevel: divisionLevel,
		radius: outerRadius,
		height: hairHeight
	});
	var innerHair_mesh;
	if (arcHair){
		innerHair_mesh = new RoundPipeModel({
			divisionLevel: divisionLevel,
			radius: innerRadius,
			height: hairHeight
		});
	} else {
		innerHair_mesh = new THREE.Mesh(new THREE.CylinderGeometry(innerRadius, innerRadius, hairHeight, divisionLevel));
	}

	// Move innerHair by some offset.
	innerHair_mesh.position.y = -hairHeight/2;
	innerHair_mesh.position.z += outerRadius - (innerRadius/2);

	var outerHair_bsp = new ThreeBSP(outerHair_mesh);
	var innerHair_bsp = new ThreeBSP(innerHair_mesh);

	var material = new THREE.MeshLambertMaterial({color: 0xff0000});

	var result_bsp = outerHair_bsp;
	var result_bsp = outerHair_bsp.subtract(innerHair_bsp);
	var result_mesh = result_bsp.toMesh(material);

	return result_mesh;
}

function RoundPipeModel(options){
	options = options || {};
	var divisionLevel = options.divisionLevel || 20;
	var radius = options.radius || 1;
	var height = options.height || 1;

	var material = new THREE.MeshLambertMaterial();
	var bowl_geo = new THREE.SphereGeometry(radius, divisionLevel, divisionLevel, 0, 2*Math.PI, 0.11, Math.PI/2);
	var bangs_geo = new THREE.CylinderGeometry(radius, radius, height, divisionLevel);
	var bowl_mesh = new THREE.Mesh(bowl_geo);

	var bangs_mesh = new THREE.Mesh(bangs_geo);
	bangs_mesh.position.y = -height/2;

	var bowl_bsp = new ThreeBSP(bowl_mesh);
	var bangs_bsp = new ThreeBSP(bangs_mesh);

	var result_bsp = bangs_bsp.union(bowl_bsp);
	var result_bsp = bowl_bsp.union(bangs_bsp);
	var result_mesh = result_bsp.toMesh(material);

	return result_mesh;
}

function HeadModel (options){
	options = options || {};
	var divisionLevel = options.divisionLevel || 20;
	var radius = options.radius || 1;

	var head_geo = new THREE.SphereGeometry(radius, divisionLevel, divisionLevel);
	var result_mesh = new THREE.Mesh(head_geo);

	return result_mesh;
}

/**
 * This file defines a 3D power line model.
 */

function PowerLineModel (options){
	options = options || {};

	var result = new THREE.Group();
	var pole_mat = new THREE.MeshBasicMaterial({color: 'black'});
	var bar_mat = new THREE.MeshBasicMaterial({color: 'darkbrown'});
	var line_mat = new THREE.LineBasicMaterial( { color: 0x000000 } );

	// Create poles.
	// var poles = [];
	var numPoles = 16;
	var spacing = 32;
	var pole_geo = new THREE.CylinderGeometry(0.05, 0.05, 5);
	var bar_geo = new THREE.BoxGeometry(0.14, 0.08, 1.2);
	var smallbar_geo = new THREE.BoxGeometry(0.14, 0.04, 0.8);
	var pole_mesh, bar_mesh, smallbar_mesh;
	var x;
	var curve1, curve2, curve1_geo, curve2_geo;
	for (var i=0; i<numPoles; i++){
		x = i*spacing - (spacing*numPoles/2);
		pole_mesh = new THREE.Mesh(pole_geo, pole_mat);
		pole_mesh.position.set(x, 0, 0.9);
		result.add(pole_mesh);

		bar_mesh = new THREE.Mesh(bar_geo, bar_mat);
		bar_mesh.position.set(x, 2.0, 0.9);
		result.add(bar_mesh);

		smallbar_mesh = new THREE.Mesh(smallbar_geo, bar_mat);
		smallbar_mesh.position.set(x, 1.8, 0.9);
		result.add(smallbar_mesh);

		//Create the lines themselves.
		curve1 = new THREE.SplineCurve3([
			new THREE.Vector3(x, 2.0, 1.5),
			new THREE.Vector3(x+spacing/2, 1.0+Math.random()*0.8, 1.5),
			new THREE.Vector3(x+spacing, 2.0, 1.5)
		]);
		curve2 = new THREE.SplineCurve3([
			new THREE.Vector3(x, 2.0, 0.3),
			new THREE.Vector3(x+spacing/2, 1.0+Math.random()*0.8, 0.3),
			new THREE.Vector3(x+spacing, 2.0, 0.3)
		]);

		curve1_geo = new THREE.Geometry();
		curve2_geo = new THREE.Geometry();
		curve1_geo.vertices = curve1.getPoints(16);
		curve2_geo.vertices = curve2.getPoints(16);

		result.add(new THREE.Line(curve1_geo, line_mat));
		result.add(new THREE.Line(curve2_geo, line_mat));
	}


	return result;
}

/**
 * This file defines a 3D retail stores model.
 */

function RetailModel (options){
	options = options || {};

	var result = new THREE.Group();
	var text_mat = new THREE.MeshBasicMaterial({color: 'black'});
	
	var storeNames = [
		'McDaniel\'s',
		'Moonbucks',
		'Brookstore',
		'TIO Daily',
		'Info Center',
		'Tickets',
		'IT Repair',
		'Quickmeals',
		'Sushi World',
		'Pizza Pizza',
		'One Dollar Mart'
	];

	var spacing = 10;
	for (var i=0; i<storeNames.length; i++){
		var name = storeNames[i];
		var text_geo = new THREE.TextGeometry(
				name,
				{font: 'helvetiker', size: 0.8, height: 0});
		var text = new THREE.Mesh(text_geo, text_mat);
		text.rotateY(Math.PI);
		text.position.set(i*spacing-storeNames.length*spacing/2, 2.4, 32);
		
		result.add(text);
	}

	return result;
}

/**
 * This file defines a 3D station roof model.
 */

function RoofModel (options){
	options = options || {};
	this.length = options.platformLength || 700;

	var roof_mat = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});
	var pole_mat = new THREE.MeshBasicMaterial({color: 'black'});
	var result = new THREE.Group();

	// Add roof.
	var roof_geo = new THREE.PlaneBufferGeometry(this.length, 16);
	var roof_mesh = new THREE.Mesh(roof_geo, roof_mat);
	roof_mesh.rotateX(Math.PI*0.6);
	roof_mesh.position.set(0, 5, 5);

	result.add(roof_mesh);

	// Add posts.
	var numPoles = 10;
	var spacing = 32;
	var pole_geo = new THREE.CylinderGeometry(0.5, 0.5, 8);
	var pole_mesh, bar_mesh, smallbar_mesh;
	var x;
	var curve1, curve2, curve1_geo, curve2_geo;
	for (var i=0; i<numPoles; i++){
		x = i*spacing - (spacing*numPoles/2);
		pole_mesh = new THREE.Mesh(pole_geo, pole_mat);
		pole_mesh.position.set(x+4, 0, 10);
		result.add(pole_mesh);
	}

	// Add signage.
	var sign = new SignModel();
	sign.rotation.y = Math.PI/2;
	sign.position.set(-10, 2.5, 7);
	result.add(sign);

	return result;
}

/**
 * This file defines a 3D seat model.
 */

function SeatModel (options){
	options = options || {};

	var material = new THREE.MeshLambertMaterial();

	var seat_geo = new THREE.BoxGeometry(1, 0.1, 1);
	var backrest_geo = new THREE.BoxGeometry(1, 1, 0.1);
	var seat_mesh = new THREE.Mesh(seat_geo);
	seat_mesh.position.z = -0.3;

	var backrest_mesh = new THREE.Mesh(backrest_geo);
	backrest_mesh.rotation.x = 0.2;
	backrest_mesh.position.y = 0.5;
	backrest_mesh.position.z = 0.2;

	var seat_bsp = new ThreeBSP(seat_mesh);
	var backrest_bsp = new ThreeBSP(backrest_mesh);

	var result_bsp = seat_bsp.union(backrest_bsp);
	var result_mesh = result_bsp.toMesh(material);

	return result_mesh;
}

/**
 * This file defines a 3D hanging sign model.
 */

function SignModel (options){
	options = options || {};
	this.width = options.width || 4;
	this.height = options.height || 1.5;
	this.poleHeight = options.poleHeight || 4.5;
	this.stripeHeight = options.stripeHeight || 0.08;

	var sign_mat = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: 'white', ambient: 'white'});
	var pole_mat = new THREE.MeshBasicMaterial({color: 'black'});
	var stripe_mat = new THREE.MeshBasicMaterial({color: 'green'});
	var text_mat = new THREE.MeshBasicMaterial({color: 'black'});
	var result = new THREE.Group();

	// Build sign.
	var sign_geo = new THREE.BoxGeometry(this.width, this.height, 0.1);
	var sign_mesh = new THREE.Mesh(sign_geo, sign_mat);
	result.add(sign_mesh);

	// Add two poles.
	var pole_geo = new THREE.CylinderGeometry(0.04, 0.04, this.poleHeight);
	var pole_mesh = new THREE.Mesh(pole_geo, pole_mat);
	pole_mesh.position.set(this.width*0.35, this.poleHeight/2, 0);
	result.add(pole_mesh);

	pole_mesh = new THREE.Mesh(pole_geo, pole_mat);
	pole_mesh.position.set(-this.width*0.35, this.poleHeight/2, 0);
	result.add(pole_mesh);

	// Add stripes.
	var stripe_geo = new THREE.PlaneBufferGeometry(this.width, this.stripeHeight);
	var stripe = new THREE.Mesh(stripe_geo, stripe_mat);
	stripe.position.set(0, 0.45-this.height/2, 0.051);
	result.add(stripe);

	stripe = new THREE.Mesh(stripe_geo, stripe_mat);
	stripe.position.set(0, 0.45-this.height/2, -0.051);
	stripe.rotateY(Math.PI);
	result.add(stripe);

	// Add text.
	var text_geo = new THREE.TextGeometry(
			'Aomori Station - Chuo Line',
			{font: 'helvetiker', size: 0.2, height: 0});
	var text = new THREE.Mesh(text_geo, text_mat);
	text.position.set(-1.7, 0.55-this.height/2, 0.051);
	result.add(text);

	text = new THREE.Mesh(text_geo, text_mat);
	text.rotateY(Math.PI);
	text.position.set(1.7, 0.55-this.height/2, -0.051);
	result.add(text);

	return result;
}

/**
 * This file defines a 3D train window model.
 */

function WindowModel (options){
	options = options || {};
	var w = options.width || 5;
	var h = options.height || 2;
	var radius = options.borderRadius || 0.5;
	var thickness = options.thickness || 2;
	var level = 8;

	// Construct a frame, then extrude.
	var points = [];

	// Top-left curve.
	var curveSpacing = radius/level;
	var r = radius, mw = w-2*r, mh = h-2*r;
	var point, x;
	for (var i=0; i<=level; i++){
		x = i*curveSpacing;
		point = new THREE.Vector2(x, Math.sqrt(2*r*x-x*x));
		points.push(point);
	}

	// Top-right curve.
	for (i=0; i<=level; i++){
		x = i*curveSpacing;
		point = new THREE.Vector2(x+mw, Math.sqrt(r*r-x*x));
		points.push(point);
	}

	// Bottom-right curve.
	for (i=level; i>=0; i--){
		x = i*curveSpacing;
		point = new THREE.Vector2(x+mw, -1*Math.sqrt(r*r-x*x)-mh);
		points.push(point);
	}

	// Bottom-left curve.
	for (i=level; i>=0; i--){
		x = i*curveSpacing;
		point = new THREE.Vector2(x, -1*Math.sqrt(2*r*x-x*x)-mh);
		points.push(point);
	}

	var window_shape = new THREE.Shape(points);
	var window_geo = new THREE.ExtrudeGeometry(window_shape, {
		curveSegments: level,
		bevelEnabled: false,
		amount: thickness
	});
	var window_mesh = new THREE.Mesh(window_geo);

	return window_mesh;
}

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

/**
 * This file contains logic related to building train mesh.
 */

function TrainModel (options){
	options = options || {};
	this.hull_length = options.hull_length || 120;
	this.hull_height = options.hull_height || 5;
	this.hull_width = options.hull_width || 5;
	this.numDoors = options.numDoors || 5;
	this.doorSpacing = options.doorSpacing || 20;
	this.seatSpacing = options.seatSpacing || 1.2;
	this.numPoles = options.numPoles || 6;
	this.spacing = options.spacing || 20;
	this.stripeHeight = options.stripeHeight || 0.3;

	// Define global materials.
	this.hull_mat = new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0xa0a0a0, ambient: 0x404040 });
	
	var hull_mesh = this.buildHull();
	var seats = this.buildSeats();
	var holdables = this.buildHoldables();

	var result = new THREE.Group();
	result.add(hull_mesh);
	for (var i=0; i<seats.length; i++){
		result.add(seats[i]);
	}
	for (i=0; i<holdables.length; i++){
		result.add(holdables[i]);
	}

	return {
		mesh: result,
		leftDoors: this.leftDoors,
		rightDoors: this.rightDoors
	};
}

TrainModel.prototype.buildHull = function (){
	var hull_length = this.hull_length;
	var hull_height = this.hull_height;
	var hull_width = this.hull_width;

	// Create the train's hull via CSG.
	var outerHull = new THREE.BoxGeometry(hull_length, hull_height, hull_width);
	var outerHull_mesh = new THREE.Mesh(outerHull, this.hull_mat);
	var outerHull_bsp = new ThreeBSP(outerHull_mesh);

	var innerHull = new THREE.BoxGeometry(hull_length-1, hull_height-0.5, hull_width-0.5);
	var innerHull_mesh = new THREE.Mesh(innerHull, this.hull_mat);
	innerHull_mesh.position.y = 0.5;		// ROOFLESS.
	var innerHull_bsp = new ThreeBSP(innerHull_mesh);
	
	var hull_bsp = outerHull_bsp.subtract(innerHull_bsp);
	var hull_group = new THREE.Group();

	// Add door openings to train via CSG.
	var numDoors = this.numDoors;
	var spacing = this.doorSpacing;
	var doorWidth = 4.5;
	var door_geo = new THREE.BoxGeometry(doorWidth, 3.8, 0.6);
	var glass_door_geo = new THREE.PlaneBufferGeometry(doorWidth/2, 3.8);
	var glass_mat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.7, side: THREE.DoubleSide});
	var glass_door;
	this.leftDoors = new THREE.Group(), this.rightDoors = new THREE.Group();
	var door_mesh = new THREE.Mesh(door_geo);
	var window_mesh = new WindowModel();
	var door_bsp, window_bsp;
	var stripe_mat = new THREE.MeshBasicMaterial({color: 'orange'});
	var stripe_width = spacing-doorWidth;
	var stripe_geo = new THREE.PlaneBufferGeometry(stripe_width, this.stripeHeight);
	for (var i=0; i<numDoors; i++){
		var doorX = i*spacing - (spacing*numDoors/2);

		// Front doors.
		door_mesh.position.set(doorX, -0.2, 2.5);
		door_bsp = new ThreeBSP(door_mesh);
		hull_bsp = hull_bsp.subtract(door_bsp);

		// Back doors.
		door_mesh.position.set(doorX, -0.2, -2.5);
		door_bsp = new ThreeBSP(door_mesh);
		hull_bsp = hull_bsp.subtract(door_bsp);

		// Add glass.
		glass_door = new THREE.Mesh(glass_door_geo, glass_mat);
		glass_door.position.set(doorX-doorWidth/4, -0.2, -2.45);
		// hull_group.add(glass_door);
		this.leftDoors.add(glass_door);

		glass_door = new THREE.Mesh(glass_door_geo, glass_mat);
		glass_door.position.set(doorX+doorWidth/4, -0.2, -2.45);
		// hull_group.add(glass_door);
		this.rightDoors.add(glass_door);

		glass_door = new THREE.Mesh(glass_door_geo, glass_mat);
		glass_door.position.set(doorX-doorWidth/4, -0.2, 2.45);
		// hull_group.add(glass_door);
		this.leftDoors.add(glass_door);

		glass_door = new THREE.Mesh(glass_door_geo, glass_mat);
		glass_door.position.set(doorX+doorWidth/4, -0.2, 2.45);
		// hull_group.add(glass_door);
		this.rightDoors.add(glass_door);

		// Windows: first.
		window_mesh.position.set(doorX+spacing/4, 1.0, 1.5);
		window_bsp = new ThreeBSP(window_mesh);
		hull_bsp = hull_bsp.subtract(window_bsp);

		window_mesh.position.set(doorX+spacing/4, 1.0, -2.5);
		window_bsp = new ThreeBSP(window_mesh);
		hull_bsp = hull_bsp.subtract(window_bsp);

		// Windows: second.
		window_mesh.position.set(doorX+spacing/2, 1.0, 1.5);
		window_bsp = new ThreeBSP(window_mesh);
		hull_bsp = hull_bsp.subtract(window_bsp);

		window_mesh.position.set(doorX+spacing/2, 1.0, -2.5);
		window_bsp = new ThreeBSP(window_mesh);
		hull_bsp = hull_bsp.subtract(window_bsp);
	
		// Add stripe.
		var stripe = new THREE.Mesh(stripe_geo, stripe_mat);
		stripe.position.set(doorX+doorWidth/2+stripe_width/2, -1, this.hull_width/2+0.001);
		hull_group.add(stripe);
	}

	// Finalize the train hull mesh.
	var hull_mesh = this.train = hull_bsp.toMesh(this.hull_mat);
	// hull_mesh.geometry.computeFaceNormals();

	hull_group.add(hull_mesh);
	hull_group.add(this.leftDoors, this.rightDoors);

	return hull_group;
};

TrainModel.prototype.buildSeats = function(){
	// Seats.
	var seats = [];
	var seatSpacing = this.seatSpacing;
	var seatWidth = 1;
	var seat_geo = new THREE.BoxGeometry(seatWidth, 0.6, 1);
	var backrest_geo = new THREE.BoxGeometry(seatWidth, 1, 0.4);
	var seat_mesh, x;
	
	var numDoors = this.numDoors;
	var doorSpacing = this.doorSpacing;
	for (var i=0; i<numDoors; i++){
		// Set initial offset to the door width.
		var doorWidth = (this.hull_height-0.5)/2;
		var offset = doorWidth+seatSpacing;
		var doorX = i*doorSpacing - (doorSpacing*numDoors/2);

		while (offset < doorSpacing-doorWidth-seatWidth){
			x = doorX + offset;

			// Front.
			seat_mesh = new SeatModel();
			seat_mesh.position.set(x, -1.4, 1.51);
			seats.push(seat_mesh);

			// Back.
			seat_mesh = new SeatModel();
			seat_mesh.position.set(x, -1.4, -1.51);
			seat_mesh.rotation.y = Math.PI;
			seats.push(seat_mesh);

			// Move to next space.
			offset += seatSpacing;
		}
	}

	return seats;
};

/**
 * Construct holdable meshes, such as poles, guide rails, etc.
 */
TrainModel.prototype.buildHoldables = function(){
	var holdables = [];

	var pole_mat = new THREE.MeshBasicMaterial({color: 'gray'});

	// Create poles.
	var poles = [];
	var numPoles = this.numPoles;
	var spacing = this.spacing;
	var pole_geo = new THREE.CylinderGeometry(0.05, 0.05, 5);
	var pole_mesh;
	for (var i=0; i<numPoles; i++){
		// Front.
		pole_mesh = new THREE.Mesh(pole_geo, pole_mat);
		pole_mesh.position.set(i*spacing - (spacing*numPoles/2), 0, 0.9);
		poles.push(pole_mesh);

		// Back.
		pole_mesh = new THREE.Mesh(pole_geo, pole_mat);
		pole_mesh.position.set(i*spacing - (spacing*numPoles/2), 0, -0.9);
		poles.push(pole_mesh);
	}
	holdables = holdables.concat(poles);

	return holdables;
};

/**
 * This file contains the logic for the train scene.
 */

function TrainScene (options){
	// Camera setup.
	var w = window.innerWidth, h = window.innerHeight;
	var camera = this.camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
	camera.position.set(0, 0, 12);
	camera.lookAt(new THREE.Vector3());
	
	// Scene setup.
	var scene = this.scene = new THREE.Group();
	this.THREEScene = new THREE.Scene();
	this.THREEScene.add(scene);
	this.THREEScene.fog = new THREE.FogExp2(0x99978E, 0.019);

	// Lighting.
	var ambient_light = new THREE.AmbientLight( 0x404040 );
	scene.add(ambient_light);

	var light = this.light = new THREE.PointLight( 0x404040, 4, 100 );
	light.position.set(0, 3, 0);
	scene.add(light);

	var light2 = this.light2 = new THREE.PointLight( 0xffffff, 0.8, 100 );
	light2.position.set(1, 1, 10);
	scene.add(light2);

	// Build geometry data and add meshes to scene.
	// this.train = {position: {}};		// Mock obj.
	this.trainModel = new TrainModel();
	this.train = this.trainModel.mesh;
	this.train.position.y -= 0.5;
	scene.add(this.train);

	var leftDoors = this.trainModel.leftDoors.children;
	this.doorPositions = Array.prototype.map.call(leftDoors, function(door){
		return door.position.x;
	});

	// Add people.
	var personTemplate = new PersonModel({scale: 0.5});
	var numPeople = Math.random()*5+10;
	var people = [], person;
	for (i=0; i<numPeople; i++){
		person = personTemplate.clone();
		person.position.set(Math.random()*40-20, -0.1, 8+Math.random()*3);
		person.rotateY(Math.PI + Math.random()*2 - 1);
		people.push(person);
		scene.add(person);
	}
	this.people = people;

	// Add floor.
	var floor = new GroundModel();
	scene.add(floor);

	// Add buildings.
	var buildings = new BuildingsModel();
	buildings.position.z = -80
	scene.add(buildings);

	// Add power lines.
	var powerLines = new PowerLineModel();
	powerLines.position.z = -10;
	scene.add(powerLines);

	// Build station.
	var roof = this.roof = new RoofModel();
	scene.add(roof);


}

TrainScene.prototype.open = function(){
	console.log('Opening train scene.');
	Audio.play(0);
	
	var train = this.train;
	var leftDoors = this.trainModel.leftDoors;
	var rightDoors = this.trainModel.rightDoors;
	train.position.x = -1200;

	var trainMove = new TWEEN.Tween(train.position)
			.delay(500)
			.to({x: 0}, 10000)
			.easing(TWEEN.Easing.Quintic.Out);

	var openLeft = new TWEEN.Tween(leftDoors.position)
			.to({x: -4.5/2}, 1000)
			.onStart(function (){
				console.log('Opening doors.')
				var openRight = new TWEEN.Tween(rightDoors.position)
						.to({x: 4.5/2}, 1000)
						.start();
			});

	var closeLeft = new TWEEN.Tween(leftDoors.position)
			.delay(10000)
			.to({x: 0}, 1000)
			.onStart(function (){
				console.log('Closing doors.')
				var closeRight = new TWEEN.Tween(rightDoors.position)
						.to({x: 0}, 1000)
						.start();
			});

	var trainDepart = new TWEEN.Tween(train.position)
			.delay(200)
			.easing(TWEEN.Easing.Quintic.In)
			.to({x: 1200}, 17000);

	var trainReset = new TWEEN.Tween(train.position)
			.to({x: -1200}, 0);

	trainReset.chain(trainMove);
	trainMove.chain(openLeft);
	openLeft.chain(closeLeft);
	closeLeft.chain(trainDepart);
	trainDepart.chain(trainReset);
	trainReset.repeat(3).start();

	var doorPositions = this.doorPositions;
	this.people.map(function (person, i){
		// Have some people stay on the platform.
		if (Math.random() > 0.5) return;

		var closestDoorX = Utils.getClosestMatch(doorPositions, person.position.x, true /* isSorted */);

		// Animate person.
		var personMove = new TWEEN.Tween(person.position)
				.delay(13000+i*100+Math.random()*1000*i)
				.to({x: Math.random()*6+closestDoorX, y: 0.5, z: Math.random()*2}, 3000)
				.start()
				.onComplete(function (){
					train.add(person);
				});
	});

	// Register keyboard events.
	Key.listenTo('keyup', this.onKeyUp.bind(this));
};

TrainScene.prototype.onKeyUp = function(e){
	// Boarding the train.
	if (Key.matches(e.keyCode, ['SPACE'])){
		if (this.boarded){
			this.train.remove(this.camera);
		} else {
			this.train.add(this.camera);
		}

		this.boarded = !this.boarded;
	}
};

TrainScene.prototype.update = function(t, delta){
	var dir = this.camera.getWorldDirection();
	dir.y = 0;
	dir.multiplyScalar(0.1);
	if (Key.isPressed(['UP', 'W'])){
		this.camera.position.add(dir);
	}
	if (Key.isPressed(['DOWN', 'S'])){
		this.camera.position.sub(dir);
	}
	if (Key.isPressed(['LEFT', 'A'])){
		this.camera.rotateY(delta/512);
	}
	if (Key.isPressed(['RIGHT', 'D'])){
		this.camera.rotateY(-delta/512);
	}
	if (Key.isPressed(['Q'])){
		this.camera.position.y += 0.05;
	} else if (Key.isPressed(['E'])){
		this.camera.position.y -= 0.05;
	}
};

/**
 * This file uses code from NeoComputer's website to create a toon-like effect 
 * using a fragment shader.
 * http://www.neocomputer.org/projects/donut/
 */

var toon = true;
if (toon){
	THREE.ShaderLib['lambert'].fragmentShader = THREE.ShaderLib['lambert'].fragmentShader.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	THREE.ShaderLib['lambert'].fragmentShader = "uniform vec3 diffuse;\n" + THREE.ShaderLib['lambert'].fragmentShader.substr(0, THREE.ShaderLib['lambert'].fragmentShader.length-1);
	THREE.ShaderLib['lambert'].fragmentShader += [
		"#ifdef USE_MAP",
		"	gl_FragColor = texture2D( map, vUv );",
		"#else",
		"	gl_FragColor = vec4(diffuse, 1.0);",
		"#endif",
		"	vec3 basecolor = vec3(gl_FragColor[0], gl_FragColor[1], gl_FragColor[2]);",
		"	float alpha = gl_FragColor[3];",
		"	float vlf = vLightFront[0];",
		// Clean and simple //
		"	if (vlf< 0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.5), alpha); }",
		"	if (vlf>=0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.3), alpha); }",
		"	if (vlf>=0.75) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.0), alpha); }",
		//"	if (vlf>=0.95) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.3), alpha); }",
		//"	gl_FragColor.xyz *= vLightFront;",
		"}"
		].join("\n");
}

/**
 * This file contains audio related logic to control sounds.
 */

/**
 * Audio module.
 */
var Audio = {
	audioTags: [
		document.getElementById('sound1'),
		document.getElementById('sound2'),
		document.getElementById('sound3'),
	],

	dynamicTag: document.getElementById('dynamicSound'),

	/**
	 * Play a sound using a predefined audio tag.
	 * 
	 * @param  {Number} index  	The audio tag index.
	 * @param  {Number} volume 	The volume from 0 to 1.
	 */
	play: function (track, volume){
		if (typeof track === 'undefined'){
			console.error('Bad track: Tried to play a missing sound');
		}

		var tag = this.audioTags[track];
		if (volume) tag.volume = volume;
		tag.play();
	},

	playSrc: function (src, volume){
		this.dynamicTag.src = src;
		if (volume) this.dynamicTag.volume = volume;
		this.dynamicTag.oncanplay = function (){
			this.play();
		};
	}
};

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
