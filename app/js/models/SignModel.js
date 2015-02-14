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
