import * as THREE from "./three.module.js";


import { SceneManager } from './SceneManager.js'
import { About } from './scenes/About.js'
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

	window.addEventListener( 'resize', onWindowResize, false );
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

	document.getElementById("btnAbout").onclick = function() { sceneManager.ChangeScene(new About()); }
	document.getElementById("btnHobbies").onclick = function() { sceneManager.ChangeScene(new HobbiesIntrests()); }
	document.getElementById("btnProjects").onclick = function() { sceneManager.ChangeScene(new Projects()); }
	
	sceneManager.ChangeScene(new About());
}

function mobileCheck() {
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};

function isAllowedOnPage()
{
	if (window.sessionStorage.getItem( 'forcedesktop' ))
		return true;

	if (mobileCheck())
		return false;
	
	return true;
}

if (isAllowedOnPage())
	init();
else
	document.location.href = '/mobile/';