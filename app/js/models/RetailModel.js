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
