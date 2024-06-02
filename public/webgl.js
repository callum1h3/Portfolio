var canvas;
var gl;

import * as THREE from "./three.module.js";

const width = window.innerWidth, height = window.innerHeight;

// init

const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0,0,0);

// animation

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}



// function InitializeWebGL()
// {
//     canvas = document.querySelector("#glcanvas");

//     ResizeCanvas();

//     window.addEventListener("resize", ResizeCanvas, false);

//     // Initialize the GL context
//     gl = canvas.getContext("webgl");

//     if (gl == null) {
//         alert(
//           "Unable to initialize WebGL. Your browser or machine may not support it.",
//         );
//         return;
//     }

//     var target_fps = 30.0;
//     setInterval(MainLoop, 1.0 / target_fps);
// }

// function ResizeCanvas()
// {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// }

// function MainLoop()
// {
//     // Set clear color to black, fully opaque
//     gl.clearColor(0.0, 0.0, 0.0, 1.0);
//     // Clear the color buffer with specified clear color
//     gl.clear(gl.COLOR_BUFFER_BIT);
// }

// InitializeWebGL();