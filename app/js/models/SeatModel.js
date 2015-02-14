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
