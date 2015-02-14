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
