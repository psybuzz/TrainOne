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
