import * as THREE from "./three.module.js";

import { SceneManager } from './SceneManager.js'
import { HobbiesIntrests } from './scenes/HobbiesIntrests.js'

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
	const camera = new THREE.PerspectiveCamera( 90, width / height, 0.01, 40 );

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	function UpdateFOV()
	{
		camera.fov = 90;
		camera.updateProjectionMatrix();
	}

	UpdateFOV();
	
	
	
	const scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(5))
	
	const renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( width, height );
	renderer.setAnimationLoop( animate );
	document.querySelector('#gameCanvas').appendChild( renderer.domElement );

	THREE.ColorManagement.legacyMode = false;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;

	//const renderTarget = new THREE.WebGLMultisampleRenderTargets( width, height, THREE.RGBFormat );

	//const composer = new EffectComposer( renderer );

	//const renderPass = new RenderPass( scene, camera );
	//composer.addPass( renderPass );

	//const bloomPass = new UnrealBloomPass(
	//	new THREE.Vector2(width, height),
	//	0.8,
	//	1.0,
	//	0.2
	//);
	//composer.addPass(bloomPass);


	//const smaaPass = new SMAAPass(width, height);
	//composer.addPass( smaaPass );

	//const outputPass = new OutputPass();
	//composer.addPass( outputPass );
	
	const sceneManager = new SceneManager(scene, camera);
	sceneManager.screenW = width;
	sceneManager.screenH = height;
	
	// animation
	
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'pointermove', onPointerMove );
	window.addEventListener( 'keypress', onKeypress );
	window.addEventListener( 'wheel', onWheelEvent );

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

		//smaaPass.setSize(window.innerWidth, window.innerHeight);
		//bloomPass.setSize(window.innerWidth, window.innerHeight);
		renderer.setSize( window.innerWidth, window.innerHeight );
		UpdateFOV();
	}

	function onPointerMove( event ) {

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components
	
		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		
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

	sceneManager.ChangeScene(new HobbiesIntrests());
}

init();