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
