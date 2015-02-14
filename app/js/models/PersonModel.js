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
