import * as THREE from "./three.module.js";

import { GLTFLoader } from './GLTFLoader.js';
import { DRACOLoader } from './DRACOLoader.js';

function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }

function convertRotation(rotation)
{
    var q = new THREE.Quaternion( -rotation.x, rotation.y, rotation.z, -rotation.w );

    var v = new THREE.Euler();  
    v.setFromQuaternion( q );

    v.y += Math.PI; // Y is 180 degrees off

    v.z *= -1; // flip Z


    return new THREE.Vector3(v.x, v.y, v.z);
}
  
class SceneModel
{
    constructor(modelPath, position, angles)
    {
        this.modelPath = modelPath;
        this.position = position;
        this.angles = convertRotation(angles);
        console.log(this.angles);
    }
}

class SceneLight
{
    constructor(position)
    {
        
    }
}

class SceneContainer
{
    constructor()
    {
        this.hasLoaded = false;

        this.Initialize = function(manager)
        {

        }

        this.Dispose = function(manager)
        {
            
        }

        this.OnIFrameLoad = function()
        {

        }

        this.onKeyPress = function(key)
        {

        }

        this.onWheelEvent = function(wheel)
        {

        }

        this.Update = function(manager, deltatime, time)
        {

        }

        this.onPointerMove = function(normalized)
        {
            
        }

        this.onPointerDown = function()
        {

        }

        this.GetSceneName = function()
        {
            return "Home";
        }
    }
}

class SceneManager
{
    constructor(THREE_SCENE, THREE_CAMERA)
    {
        this.THREE_CAMERA = THREE_CAMERA;
        this.THREE_SCENE = THREE_SCENE;
        this.scene = null;
        this.new_scene = null;
        this.isLocked = false;
        this.targetTranspancy = 0;

        this.loadTarget = 0;
        this.loadCurrent = 0;

        this.isWaitingForOpaque = false;
        this.isWaitingForLoading = false;

        this.screenW = 0;
        this.screenH = 0;

        this.ClearScene = function()
        {
            var z = 0;
            for (let i = 0; i < this.THREE_SCENE.children.length; i++) 
            {
                var obj = this.THREE_SCENE.children[i - z];
                this.THREE_SCENE.remove(obj); 
                z++;
           }
        }
        

        this.ChangeScene = function(sceneContainer)
        {
            if (this.isLocked)
                return;

            this.isLocked = true;
            this.SetFadeIn();
            this.new_scene = sceneContainer;

            this.SetLoadingPercent(0);
            this.isWaitingForOpaque = true;
        }

        this.__ChangeScene = function()
        {
            this.isWaitingForOpaque = false;

            if (this.scene != null)
            {
                this.scene.Dispose(this);
                this.scene = null;
            }

            this.scene = this.new_scene;
            this.new_scene = null;
 
            this.LoadingSequence();
        }

        this.onKeyPress = function(key)
        {
            if (this.scene != null)
                this.scene.onKeyPress(key);
        }

        this.onWheelEvent = function(wheel)
        {
            if (this.scene != null)
                this.scene.onWheelEvent(wheel);
        }

        this.LoadingSequence = function()
        {
            const sceneManager = this;

            //this.ClearScene();
            
            var loader = new THREE.ObjectLoader();
            // TODO : input yout exported json file
            var url = '../';
            loader.load("./unityscenes/"+sceneManager.scene.GetSceneName()+"/scene.json", 
                function(obj) {
                    sceneManager.setupScene(obj);
                    sceneManager.LoadEnd();

                    //obj.children.forEach(sceneManager.ObjectDebug);
                },
                function ( xhr ) {
                    var percentage = (xhr.loaded / xhr.total * 100);
                    console.log( percentage + '% loaded' );
                    sceneManager.SetLoadingPercent(percentage);
                },  
            );
            

            //document.getElementsByClassName("customUI").innerHTML = "<script>alert('I am John in an annoying alert!')</script>";


        }

        this.ObjectDebug = function(child)
        {
            console.log(child);
        }

        this.findByUserData = function(node, key, value) {
            if(node.userData && node.userData[key] == value) {
                return node;
            }
            for(var i = 0 ; i < node.children.length ; i++) {
                var child = node.children[i];
                var found = this.findByUserData(child, key, value);
                if(found != null) {
                    return found;
                }
            }
            return undefined;
        }

        this.findByName = function(name, func)
        {
            this.THREE_SCENE.traverse(function(child){
                if (child.name == name)
                    func(child);
            });
        }

        this.CAMERA_ROT_X = 0.0;
        this.CAMERA_ROT_Y = 0.0;
        this.CAMERA_ROT_Z = 0.0;

        this.CAMERA_POS_X = 0.0;
        this.CAMERA_POS_Y = 0.0;
        this.CAMERA_POS_Z = 0.0;

        this.CAMERA_TARGET_ROT_X = 0.0;
        this.CAMERA_TARGET_ROT_Y = 0.0;
        this.CAMERA_TARGET_ROT_Z = 0.0;

        this.CAMERA_TARGET_POS_X = 0.0;
        this.CAMERA_TARGET_POS_Y = 0.0;
        this.CAMERA_TARGET_POS_Z = 0.0;

        this.cameraSetPosition = function(x,y,z)
        {
            this.CAMERA_POS_X = x;
            this.CAMERA_POS_Y = y;
            this.CAMERA_POS_Z = z;

            this.cameraTargetPosition(x,y,z);
        }

        this.cameraSetAngles = function(x,y,z)
        {
            this.CAMERA_ROT_X = x;
            this.CAMERA_ROT_Y = y;
            this.CAMERA_ROT_Z = z;

            this.cameraTargetAngles(x,y,z);
        }

        this.cameraTargetPosition = function(x,y,z)
        {
            this.CAMERA_TARGET_POS_X = x;
            this.CAMERA_TARGET_POS_Y = y;
            this.CAMERA_TARGET_POS_Z = z;            
        }

        this.cameraTargetAngles = function(x,y,z)
        {
            this.CAMERA_TARGET_ROT_X = x;
            this.CAMERA_TARGET_ROT_Y = y;
            this.CAMERA_TARGET_ROT_Z = z;            
        }

        this.setupScene = function(result) 
        {
            var camera = this.findByUserData(result, "tag", "MainCamera");

            if (camera)
            {
                this.cameraSetPosition(camera.position.x, camera.position.y, camera.position.z);
                this.cameraSetAngles(-camera.rotation.x, -camera.rotation.y, camera.rotation.z);
                this.THREE_CAMERA.fov = camera.fov;
            }
            this.THREE_SCENE.add( result );
                
        }

        this.onPointerDown = function()
        {
            if (this.scene == null)
                return;
            
            this.scene.onPointerDown();
        }

        this.OnIframeLoad = function()
        {
            if (this.scene == null)
                return;

            this.scene.hasLoaded = true;
            this.scene.OnIFrameLoad();
        }

        this.LoadEnd = function()
        {
            var self = this;
            var iframe = document.getElementsByClassName('iFrameName')[0];
            iframe.src = "./unityscenes/"+this.scene.GetSceneName()+"/page.html?transparent=0";
            iframe.onload = function() {
                self.OnIframeLoad();
            };

            this.isWaitingForLoading = false;
            this.scene.Initialize(this);
            this.SetFadeOut();
            this.isLocked = false;
        }

        this.HasLoadedEverything =  function()
        {
            return this.loadCurrent >= this.loadTarget;
        }

        this.AddLoad = function()
        {
            this.loadCurrent += 1;

            var percent = (this.loadCurrent / this.loadTarget) * 100;
            this.SetLoadingPercent(percent);
        }

        this.WaitForOpaque = function()
        {
            return this.IsTranspancyAtTarget(1.0);
        }

        this.onPointerMove = function(normalized)
        {
            if (this.scene != null)
                this.scene.onPointerMove(normalized);
        }

        this.Update = function(deltatime, time)
        {
            if (this.isWaitingForOpaque)
                if (this.WaitForOpaque())
                    this.__ChangeScene();

            var speed = deltatime * 2;
            var roty = (Math.sin(time) * 0.005);
            var rotz = (Math.sin(time + 1238.28) * 0.004);

            this.CAMERA_ROT_X = lerp(this.CAMERA_ROT_X, this.CAMERA_TARGET_ROT_X, speed);
            this.CAMERA_ROT_Y = lerp(this.CAMERA_ROT_Y, this.CAMERA_TARGET_ROT_Y + roty, speed);
            this.CAMERA_ROT_Z = lerp(this.CAMERA_ROT_Z, this.CAMERA_TARGET_ROT_Z + rotz, speed);

            this.CAMERA_POS_X = lerp(this.CAMERA_POS_X, this.CAMERA_TARGET_POS_X, speed); 
            this.CAMERA_POS_Y = lerp(this.CAMERA_POS_Y, this.CAMERA_TARGET_POS_Y, speed);
            this.CAMERA_POS_Z = lerp(this.CAMERA_POS_Z, this.CAMERA_TARGET_POS_Z, speed); 

            this.THREE_CAMERA.position.set(this.CAMERA_POS_X, this.CAMERA_POS_Y, this.CAMERA_POS_Z);
            this.THREE_CAMERA.rotation.set(this.CAMERA_ROT_X, this.CAMERA_ROT_Y, this.CAMERA_ROT_Z);

            if (this.scene != null)
                this.scene.Update(this, deltatime, time);
        }

        this.SetFadeIn = function()
        {
            $("#overlay").fadeIn(1000,"linear");
        }

        this.SetFadeOut = function()
        {
            $("#overlay").delay(600).fadeOut(1000,"linear");
        }


        this.IsTranspancyAtTarget = function(target)
        {
            return Math.abs(this.GetLoadingTranspancy() - this.targetTranspancy) < 0.01;
        }

        this.SetLoadingPercent = function(percent)
        {
            var elem = document.getElementById("myBar");
            elem.style.width = percent + "%";
        }

        this.GetLoadingTranspancy = function()
        {
            var elem = document.getElementById("overlay");
            return elem.style.opacity;
        }    
    }
}

export { SceneContainer, SceneManager, SceneLight, SceneModel };
