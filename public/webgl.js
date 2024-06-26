import * as THREE from "./three.module.js";

import { SceneManager } from './SceneManager.js'
import { HobbiesIntrests } from './scenes/HobbiesIntrests.js'
import { Projects } from './scenes/Projects.js'

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { OutputPass } from './jsm/postprocessing/OutputPass.js';
import { SMAAPass } from './jsm/postprocessing/SMAAPass.js';
import { OutlinePass } from './jsm/postprocessing/OutlinePass.js';

//import { FlyControls } from './jsm/controls/FlyControls.js';

//import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
//import { RenderPass } from './jsm/postprocessing/RenderPass.js';
//import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
//import { OutputPass } from './jsm/postprocessing/OutputPass.js';
//import { SMAAPass } from './jsm/postprocessing/SMAAPass.js';

function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }

function init()
{
	const width = window.innerWidth, height = window.innerHeight;
	const camera = new THREE.PerspectiveCamera( 90, width / height, 0.01, 2000 );

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	function UpdateFOV()
	{
		camera.fov = 90;
		camera.updateProjectionMatrix();
	}

	UpdateFOV();
	
	
	
	const scene = new THREE.Scene();
	
	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( width, height );
	renderer.setAnimationLoop( animate );
	document.querySelector('#gameCanvas').appendChild( renderer.domElement );

	THREE.ColorManagement.legacyMode = false;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;

	const sceneManager = new SceneManager(scene, camera);
	sceneManager.screenW = width;
	sceneManager.screenH = height;
	
	// animation
	var iframe = document.getElementsByClassName('iFrameName')[0];

	document.body.addEventListener( 'resize', onWindowResize, false );
	document.body.addEventListener( 'pointermove', onPointerMove, false);
	document.body.addEventListener( 'keypress', onKeypress );
	document.body.addEventListener( 'wheel', onWheelEvent );

	function onWheelEvent(wheel)
	{
		sceneManager.onWheelEvent(wheel);
	}

	function onKeypress(key)
	{
		sceneManager.onKeyPress(key);
	}
	
	function onWindowResize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		sceneManager.screenW = window.innerWidth;
		sceneManager.screenH = window.innerHeight;
		sceneManager.OnResize();
		
		renderer.setSize( window.innerWidth, window.innerHeight );
		UpdateFOV();

		
	}

	function onPointerMove( event ) {

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components
	
		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		console.log(pointer);
		sceneManager.onPointerMove(pointer);
	}

	var lastHovered = null;

	document.body.onmousedown = function() 
	{ 
		if (lastHovered != null)
			lastHovered.onMouseDown();

		sceneManager.onPointerDown();
	}

	function cameraAnimate()
	{

		raycaster.setFromCamera( pointer, camera );
		const intersects = raycaster.intersectObjects( scene.children );

		if (lastHovered == null)
			$('html,body').css('cursor', 'default');
		else
			$('html,body').css('cursor', 'pointer');
		
		for ( let i = 0; i < intersects.length; i ++ ) {
			var obj = intersects[ i ].object;
			if ( obj.onHover != null)
			{
				if (lastHovered != obj)
				{
					if (lastHovered != null)
						lastHovered.onHoverEnd();
					lastHovered = obj;
					lastHovered.onHoverStart();
				}

				obj.onHover();
				return;
			}

		}

		if (lastHovered != null)
			lastHovered.onHoverEnd();
		lastHovered = null;
	}

	var lastTime = 0;
	
	function animate( time ) {
		
		var actual_time = time / 1000;

		var deltaTime = actual_time - lastTime;
		lastTime =  actual_time;

		if (deltaTime > 1)
			deltaTime = 1;

		sceneManager.Update(deltaTime, actual_time);
		cameraAnimate();

		renderer.render(scene, camera);

		//composer.render(deltaTime);
	}

	document.getElementById("btnHobbies").onclick = function() { sceneManager.ChangeScene(new HobbiesIntrests()); }
	document.getElementById("btnProjects").onclick = function() { sceneManager.ChangeScene(new Projects()); }
	
	sceneManager.ChangeScene(new Projects());
}

init();