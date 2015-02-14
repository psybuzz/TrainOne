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
