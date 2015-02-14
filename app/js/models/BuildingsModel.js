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
