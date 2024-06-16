import { SceneManager, SceneModel, SceneContainer } from '../SceneManager.js';
import * as THREE from "../three.module.js";
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../GLTFLoader.js';
import { DRACOLoader } from '../DRACOLoader.js';

function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }

function lerpVec (start, end, amt){
    return new THREE.Vector3(
        lerp(start.x, end.x, amt),
        lerp(start.y, end.y, amt),
        lerp(start.z, end.z, amt),

    );
}
function clamp(a, min, max) {
    return Math.min(Math.max(a, min), max);
  };

class HobbiesIntrests extends SceneContainer 
{
    constructor()
    {
        super();

        this.roomKey1 = null;
        this.roomKey2 = null;
        this.roomLookAt = null;
        this.interactables = [];
        this.currentHover = null;
        this.animationMixer = null;
        this.intro = true;
        this.introLerp = 0;
        this.isIntroTipActive = true;
        this.loadedTrader = false;

        this.RegisterInteractable = function(obj, name, description, scale)
        {
            var interact = {};
            interact.r = 0;
            interact.g = 0;
            interact.b = 0;
            interact.obj = obj;
            interact.name = name;
            interact.description = description;

            this.interactables.push(interact);

            interact.updateEmission = function()
            {
                this.obj.material.emissive.set(this.r,this.g,this.b);
            }

            obj.previewScale = scale;
            obj.description = description;
            obj.previewName = name;
            
            var self = this;
            obj.onHoverStart = function()
            {
                self.OnInteract(obj);
            }

            obj.onHoverEnd = function()
            {
                self.OnInteractEnd(obj);
            }

            obj.onMouseDown = function()
            {
                self.OnMouseButtonDown(obj);
            }

            obj.onHover = function()
            {
                
            }
        }

        this.SetIntro = function(val)
        {
            this.intro = val;

            
        }

        this.UpdateInteractables = function(time, deltatime)
        {
            if (this.intro)
                return;

            this.interactables.forEach((element) => {
                var target_total = ((Math.sin(time * 1.5) / 2 ) + 0.5) * 0.05;

                if (element.obj.hasInteractedAlready != null)
                    target_total = 0;
                
                var target_r = (255 / 255) * target_total;
                var target_g = (187 / 255) * target_total;
                var target_b = (0 / 255) * target_total;

                element.r = lerp(element.r, target_r, deltatime);
                element.g = lerp(element.g, target_g, deltatime);
                element.b = lerp(element.b, target_b, deltatime);

                element.updateEmission();
            });
        }

        this.OnInteract = function(obj)
        {
            this.currentHover = obj;
        }

        this.onPointerDown = function()
        {

        }

        this.exitMenu = function()
        {
            this.targetMenu = 0.0;
        }

        this.OnMouseButtonDown = function(obj)
        {
            if (this.isLoaded == null)
                return;

            if (this.intro)
                return;

            this.scene.remove(this.object)
            
            obj.hasInteractedAlready = true;

            this.object = obj.clone();
            this.object.position.set(0,0,0);
            this.object.scale.set(obj.previewScale,obj.previewScale,obj.previewScale);
            this.object.material = this.object.material.clone();
            this.object.material.emissive.set(0,0,0);

            var iframe = document.getElementsByClassName('iFrameName')[0];
            var description = iframe.contentWindow.document.querySelector('#description');
            description.innerHTML = obj.description;

            var self = this;
            var description = iframe.contentWindow.document.body.onmousedown = function() 
            {
                self.exitMenu();
            }

            var name = iframe.contentWindow.document.querySelector('#name');
            name.innerHTML = obj.previewName;

            this.scene.add(this.object);
            this.targetMenu = 1.0;
        }

        this.OnInteractEnd = function(obj)
        {
            this.currentHover = null;
        }

        this.RegisterItem = function(objname, name, description, scale)
        {
            var self = this;
            this.manager.findByName(objname, function(obj) {
                self.RegisterInteractable(obj, name, description, scale);
            });            
        }

        this.Initialize = function(manager)
        {
            this.manager = manager;
            this.targetMenu = 0.0;
            this.currentMenu = 0.0;
            this.isIntroTipActive = true;
            this.subtitleQueue = "";
            this.subtitleCache = "";
            this.fadeOutSequence = 0;

            var self = this;
            
            this.manager.findByName("RoomKey1", function(obj) {
                self.roomKey1 = obj;
            });

            this.manager.findByName("RoomKey2", function(obj) {
                self.roomKey2 = obj;
            });

            this.manager.findByName("RoomLookPos", function(obj) {
                self.roomLookAt = obj;
            });

            
            this.manager.findByName("IntroDoor", function(introdoor) {
                self.introdoor = introdoor;
            }); 

            this.manager.findByName("trader", function(traderposition) {
                self.traderposition = traderposition.position;
                self.LoadTrader(traderposition)
            }); 

            this.manager.findByName("IntroStart", function(pos) {
                self.introStart = pos.position.clone();
            }); 

            this.manager.findByName("IntroEnd", function(pos) {
                self.introEnd = pos.position.clone();
            }); 

            this.RegisterItem("Bear Detector", '"Bear" detector', "The bear detector, an item from my favorite game series, 'S.T.A.L.K.E.R'. It's name is an anomaly itself. ", 16);
            this.RegisterItem("Dumbell", 'Dumbbell', "A dumbbell which shows my love for the gym, touching grass is important every once in a while.", 0.3);

            this.SetIntro(true);

            //this.onFinishIntroSequence();
        }

        this.onKeyPress = function(key)
        {

        }

        this.onFinishIntroSequence = function()
        {
            this.intro = false;
            this.introLerp = 1.0;
            this.FadeOutIntroTip();

            var self = this;

            self.SetSubtitles("What are you standing there for? Come closer...", function() {
                self.SetSubtitles("Welcome to Callum's corner, you can interact with any of the highlighted items!", function() {
                    self.SetSubtitles("These items links towards Callum's hobbies and intrests.", function() {
                        self.SetSubtitles("I don't know why I work in a store that doesn't sell anything ;(", function() {
                
                        });                  
                    });                    
                });                
            });
        }

        this.onWheelEvent = function(wheel)
        {
            if (!this.CanIntroSequence())
                return;

            if (!this.intro)
                return;

            this.introLerp += 0.02;
            this.FadeOutIntroTip();
            if (this.introLerp > 1.0)
                this.onFinishIntroSequence();
        }



        this.CanIntroSequence = function()
        {
            if (this.introdoor == null)
            {
                console.log("Cannot start intro sequence no door found!");
                return false;
            }

            if (!this.loadedTrader)
            {
                console.log("Cannot start intro sequence trader not loaded!");
                return false;
            }

            return true;
        }

        this.LoadTrader = function(traderposition)
        {
            var self = this;
            const loader = new GLTFLoader();

            // Optional: Provide a DRACOLoader instance to decode compressed mesh data
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath( '../libs/draco/' );
            loader.setDRACOLoader( dracoLoader );

            

            // Load a glTF resource
            loader.load(
                // resource URL
                '../models/stalker_trader.glb',
                // called when the resource is loaded
                function ( gltf ) {
                    
                    traderposition.add( gltf.scene );

                    gltf.animations; // Array<THREE.AnimationClip>
                    gltf.scene; // THREE.Group
                    gltf.scenes; // Array<THREE.Group>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object

                    var mesh = gltf.scene.children[0].children[0];
                    self.traderhead = gltf.scene.children[0].children[1].children[2].children[0].children[0].children[0];

                    const texture = new THREE.TextureLoader().load('../images/act_trader_barman.png' ); 
                    texture.encoding = THREE.sRGBEncoding;
                    texture.flipY = false;

                    const material = new THREE.MeshStandardMaterial( { map:texture, metalness:0.0, roughness:1.0 } );

                    mesh.material = material; 
                    console.log(mesh.material.map);

                    self.animationMixer = new THREE.AnimationMixer(gltf.scene);
                    self.animationActions = [];


                    gltf.animations.forEach(function(currentValue, index, arr) {
                        const animationAction = self.animationMixer.clipAction(currentValue);
                        self.animationActions.push(animationAction);
                    });

                    self.animationActions[4].play();

                    self.loadedTrader = true;


                },
                // called while loading is progressing
                function ( xhr ) {
                },
                // called when loading has errors
                function ( error ) {

                    console.log( error );

                }
            );
        }

        this.OnMouseDown = function()
        {
            this.ObjectSelection();
        }

        this.SetFramePointer = function(str)
        {
            var iframe = document.getElementsByClassName('iFrameName')[0];
            iframe.style.pointerEvents = str;
        }

        this.FadeOutIntroTip = function()
        {
            if (!this.isIntroTipActive)
                return;

            console.log("Fading out intro tip.");
            this.isIntroTipActive = false;
            var iframe = $('.iFrameName');
            $('#introTip', iframe.contents()).fadeOut();
        }

        this.SetMenuTransparency = function(alpha)
        {
            var iframe = document.getElementsByClassName('iFrameName')[0];
            var frame = iframe.contentWindow.document.querySelector('#itemContext');

            if (alpha < 0.02)
            {
                iframe.style.pointerEvents = "none";
                alpha = 0;
            }

            if (alpha > 0.98)
            {
                iframe.style.pointerEvents = "auto";
                alpha = 1;
            }

            frame.style.opacity = alpha;
        }

        this.OnIFrameLoad = function()
        {
            var self = this;
            var iframe = document.getElementsByClassName('iFrameName')[0];

            this.SetMenuTransparency(0.0);

            this.camera = new THREE.PerspectiveCamera( 90, 500 / 500, 0.01, 40 );

            this.controls = new OrbitControls( this.camera, iframe );

            this.camera.position.z = 2;
            this.controls.update();

            this.scene = new THREE.Scene();
            
            this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
            this.renderer.setClearColor( 0x000000, 0 );
            this.renderer.setSize( 500, 500 );
            this.renderer.setAnimationLoop( function() {
                self.animationLoop();
            } );

            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            

            iframe.contentWindow.document.querySelector('#itemCanvas').appendChild( this.renderer.domElement );

            const geometry = new THREE.BoxGeometry( 1, 1, 1 );
            const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
            this.object = new THREE.Mesh( geometry, material );
            this.scene.add( this.object );

            var light;
            light = new THREE.DirectionalLight( 0xffffff );
            light.position.set( 1, 1, 1 );
            this.scene.add( light );
          
            light = new THREE.DirectionalLight( 0x002288 );
            light.position.set( -1, -1, -1 );
            this.scene.add( light );
          
            light = new THREE.AmbientLight( 0x222222 );
            this.scene.add( light );
            this.isLoaded = true;

            var iframe = document.getElementsByClassName('iFrameName')[0];
            this.subtitles = iframe.contentWindow.document.querySelector('#subtitles');
        }

        this.animationLoop = function()
        {
            if (this.targetMenu < 0.02)
                return;
            
            this.renderer.render( this.scene, this.camera );
            this.controls.update();

            
            this.object.rotation.x += 0.01;
            this.object.rotation.y += 0.01;
        }

        this.Dispose = function(manager)
        {

        }

        this.Update = function(manager, deltatime, time)
        {
            this.UpdateCameraLookAt();
            this.UpdateInteractables(time, deltatime);

            if (this.isLoaded)
            {
                this.currentMenu = lerp(this.currentMenu, this.targetMenu, deltatime * 8);
                this.SetMenuTransparency(this.currentMenu);
            }

            this.UpdateTrader(deltatime);
            this.UpdateIntro(deltatime);
            this.UpdateSubtitles(time, deltatime);
        }

        this.ShouldFadeoutSubtitles = function(time)
        {
            var dir = Number(this.subtitleCache.length > 0 || this.subtitleQueue.length > 0);

            if (this.hasntStartedFadedOut)
                if (time > this.fadeOutSequence)
                    return 0.0;
          
            return dir;
        }

        this.UpdateSubtitles = function(time, deltatime)
        {
            if (!this.isLoaded)
                return;

            if (this.subtitles == null)
                return;

            if (this.traderhead == null)
                return;

            var pos = new THREE.Vector3(0,0,0);
            this.traderhead.getWorldPosition(pos);

            var headposition = pos.add(new THREE.Vector3(0,0.2,0));

            var dir = this.ShouldFadeoutSubtitles(time);
            this.subtitles.style.opacity = lerp(this.subtitles.style.opacity, dir, deltatime * 6);

            if (this.subtitles.style.opacity < 0.01 && dir < 0.5)
            {
                this.subtitles.style.opacity = 0;

                if (this.subtitleFunc != null)
                {
                    var lastFunc = this.subtitleFunc;
                    this.subtitleFunc = null;
                    lastFunc();
                    
                }
                return;
            }
 

            headposition.project( this.manager.THREE_CAMERA );
            headposition.x = ( headposition.x + 1) * this.manager.screenW / 2;
            headposition.y = - ( headposition.y - 1) * this.manager.screenH / 2;
            headposition.z = 0;
            
            this.subtitles.style.left = headposition.x + "px";
            this.subtitles.style.top = headposition.y + "px";

            if (this.lastSubtitle != null)
            {
                if (time < this.lastSubtitle)
                    return;
            }

            this.lastSubtitle = time + 0.08;

            if (this.subtitleQueue.length < 1 && this.subtitleCache.length > 0)
            {
                if (!this.hasntStartedFadedOut)
                {
                    this.fadeOutSequence = time + 3.0;
                    this.hasntStartedFadedOut = true;
                }

                if (time > this.fadeOutSequence)
                {
                    if (dir == 0 && this.subtitles.style.opacity < 0.02)
                    {
                        this.subtitles.style.opacity = 0;
                        this.subtitleCache = "";
                    }       
                }
            }

            if (this.subtitleQueue.length > 0)
            {

                this.subtitleCache += this.subtitleQueue[0];
                this.subtitleQueue = this.subtitleQueue.slice(1);    
            }

            this.subtitles.innerHTML = this.subtitleCache;
        }

        this.SetSubtitles = function(txt, func)
        {
            this.subtitleQueue = txt;
            this.subtitleCache = "";
            this.hasntStartedFadedOut = false;
            this.fadeOutSequence = 0;
            this.subtitleFunc = func;
        }

        this.UpdateIntro = function(deltatime)
        {
            if (!this.intro)
                return;

            if (!this.CanIntroSequence())
                return;
            //console.log(this.introdoor.rotation.y);

            var doorlerp = clamp(this.introLerp * 2, 0, 1);
            var target_door_y = lerp(1.57079626908, -0.6, doorlerp);

            this.introdoor.rotation.y = lerp(this.introdoor.rotation.y, target_door_y, deltatime * 6);

            var positionLerp = clamp((this.introLerp - 0.5) * 2, 0, 1);
            var targetPosition = lerpVec(this.introStart, this.introEnd, positionLerp);
            this.manager.cameraTargetPosition(targetPosition.x, targetPosition.y, targetPosition.z);
            

            //this.introLerp
        }

        this.UpdateTrader = function(deltatime)
        {
            if (!this.loadedTrader)
                return;
            
            this.animationMixer.update(deltatime);
        }

        this.UpdateCameraLookAt = function()
        {
            if (this.roomLookAt == null)
                return;

            if (this.intro)
                return;

            this.roomLookAt.lookAt(this.manager.THREE_CAMERA.position.x, this.manager.THREE_CAMERA.position.y, this.manager.THREE_CAMERA.position.z);
            var lookAt = this.roomLookAt.rotation.clone();

            this.manager.cameraTargetAngles(lookAt.x, lookAt.y, lookAt.z);
        }

        this.onPointerMove = function(normalized)
        {
            if (this.roomKey1 == null)
                return;
            if (this.roomKey2 == null)
                return;
            if (this.roomLookAt == null)
                return;

            if (this.intro)
                return;

            var vec = lerpVec(this.roomKey1.position, this.roomKey2.position, (normalized.x / 2) + 1);
            this.manager.cameraTargetPosition(vec.x, vec.y, vec.z);  
        }

        this.GetSceneName = function()
        {
            return "SampleScene";
        }
    }


}

export { HobbiesIntrests };
