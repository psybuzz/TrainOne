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
