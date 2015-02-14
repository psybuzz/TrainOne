/**
 * This file defines a 3D train window model.
 */

function WindowModel (options){
	options = options || {};
	var w = options.width || 5;
	var h = options.height || 2;
	var radius = options.borderRadius || 0.5;
	var thickness = options.thickness || 2;
	var level = 8;

	// Construct a frame, then extrude.
	var points = [];

	// Top-left curve.
	var curveSpacing = radius/level;
	var r = radius, mw = w-2*r, mh = h-2*r;
	var point, x;
	for (var i=0; i<=level; i++){
		x = i*curveSpacing;
		point = new THREE.Vector2(x, Math.sqrt(2*r*x-x*x));
		points.push(point);
	}

	// Top-right curve.
	for (i=0; i<=level; i++){
		x = i*curveSpacing;
		point = new THREE.Vector2(x+mw, Math.sqrt(r*r-x*x));
		points.push(point);
	}

	// Bottom-right curve.
	for (i=level; i>=0; i--){
		x = i*curveSpacing;
		point = new THREE.Vector2(x+mw, -1*Math.sqrt(r*r-x*x)-mh);
		points.push(point);
	}

	// Bottom-left curve.
	for (i=level; i>=0; i--){
		x = i*curveSpacing;
		point = new THREE.Vector2(x, -1*Math.sqrt(2*r*x-x*x)-mh);
		points.push(point);
	}

	var window_shape = new THREE.Shape(points);
	var window_geo = new THREE.ExtrudeGeometry(window_shape, {
		curveSegments: level,
		bevelEnabled: false,
		amount: thickness
	});
	var window_mesh = new THREE.Mesh(window_geo);

	return window_mesh;
}
