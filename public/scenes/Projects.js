import { SceneManager, SceneModel, SceneContainer } from '../SceneManager.js';
import * as THREE from "../three.module.js";
import { ScreenQuad } from "../libs/ScreenQuad.js"

const backgroundFragment = `
varying vec2 vUv;

uniform sampler2D uTexture;
uniform float u_time;

float remap( float minval, float maxval, float curval )
{
    return ( curval - minval ) / ( maxval - minval );
} 

float sampleTex(vec2 uv)
{
    return texture2D( uTexture , uv ).r;
}

void main(){
    float total = 0.0;

    vec2 time_offset = vec2(u_time * 0.001, u_time * 0.002);
    for (int x = -1; x < 1; x++) 
    {
        for (int y = -1; y < 1; y++) 
        {
            vec2 uv = (vUv * 0.01);
            uv.x = uv.x * float(x * 8);
            uv.y = uv.y * float(y * 8);
            
            uv = uv + time_offset;
            
            total = total + sampleTex(uv);
        }
    }
    float h = total / 8.0;

    h = h * 0.1;
    h = h + 0.05;

	gl_FragColor = vec4(h,h,h, 1.0);
    
}`;

function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }

  function clamp(a, min, max) {
    return Math.min(Math.max(a, min), max);
  };

class Projects extends SceneContainer
{
    constructor()
    {
        super();

        this.manager = null;

        this.InitBackground = function() {
            var self = this;
            this.background = new ScreenQuad( {fragmentShader : backgroundFragment});
            this.manager.THREE_SCENE.add( this.background );

            const loader = new THREE.TextureLoader();

            loader.load(
                '../images/perlin.png',

                function ( texture ) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    const uniforms = self.background.material.uniforms;
                    uniforms.uTexture.value = texture;
                },
                undefined,
                function ( err ) {
                    console.error( 'An error happened.' );
                }
            );

            this.background.material.dithering = true
        }

        this.RegisterProject = function(id, title, description, nummarkers, interactdescs)
        {
            var project = {
                title: title,
                description: description,
                nummarkers : nummarkers,
                interacts: [],
                interactdescs: interactdescs
            }

            this.manager.findByName("Project"+id, function(cam) {
                project.camera = cam;
            }); 

            for (let i = 0; i < nummarkers; i++)
            {
                this.manager.findByName("Project"+id+"Interact"+i, function(inter) {
                    project.interacts.push(inter);
                });                 
            }

            this.projects.push(project);
        }

        this.OnResize = function(screenW, screenH)
        {
            if (this.background == null)
                return;

            this.background.setScreenSize(screenW, screenH);
        }

        this.Initialize = function(manager)
        {
            this.manager = manager;

            manager.THREE_SCENE.traverse(function(obj) 
            {
                if (obj.type != "Mesh")
                    return;

                obj.material.normalMapType  = THREE.ObjectSpaceNormalMap;

                //var material = new THREE.MeshToonMaterial({
                //    color: obj.material.color
                //});

                // obj.material = material;
            })

            this.InitBackground();

            this.projects = [];
            this.RegisterProject(0, "Untitled SCP Game", "I have been working on this game in colaboration with two friends since 2023 as a long term project to help develop or programing skills. We made the game within the SCP universe and based it on other popular games such as Containment Breach, but focusing on the multiplayer aspect.As the only programmer on this project I am responsible for the development of frameworks to integrate all the ideas we want in the game.<br><br>So far we have been working on it for around a year and we have many features such as P2P Multiplayer (SteamNetworkingSockets), Level Streaming (Room System), Networked Entity System (Links with Level Streaming), A* Node-Based Pathfinding, Event System, Entity Interaction Framework and much more!", 5, [
                "<p>In the game cameras are used by hostile facility artificial intelligence to locate players and help other hostile entities to catch the players.<br><br>When hostile entities need help hacking devices such as doors, it will send a request to the AI to open the door<br>The AI will be tasked with prioitising tasks forcing it to pick which devices to hack first to get to the player.<br><br>This will force players to split up because the AI cannot handle the pressure of managing multiple different locations.<\p> ",
                '<p>The game has many obstacles such as doors that can either;<br>block hostile entities from advancing towards the player or block the player from fleeing.<br><br>The entity system handles alot of synchronization between the doors and players allowing the door to be opened from various sources such as keypads, npcs (Facility AI) and events without any issues.<br><br>Alot of the issues when developing this system is designing a workflow to easily add new entity types into the system while giving the level designers the ability to easily customize attributes on the entity.<\p><img src="./gifs/door.gif">',
                '<p>One of the ways players trade items is by using the vending machines that are scattered across the map!<br>The vending machines have a in world user interface which will inturn immerse the player into the world.<br><br>The level designer can add custom vending machines types that will use color codes to tell the user what types of items it sells.<br><br>One of the main challanges with this system is developing a framework to allow users to interact with in world screens. We could of just kept with the default unity UI system however we wanted a system that would immerse the player.<br><br>The system captures the UI into a render texture that can be later rendered onto a plane with a custom screen style shader. However, having multiple render textures being updated every frame can be costly so we prioritize screens that are in the same room as the player and if they are looking at it.<\p><img src="./gifs/vendingmachine.gif">',
                '<p>Many entities in the game can generate power which can be used to power other entities such as doors. This is managed by my electrical grid system which allows us to create various entities that can supply or consume electricity in a area.<\p><img src="./gifs/generator.gif">',
                '<p>The "Room System" is the core of this project and it allows seemless level streaming since each room in the facility is contained in its own individual scene. This allows the designers to modularize their workflow by reusing the same scene for different areas and increasing the performance by the game by running most of the game logic in a background thread!<\p>'
            ]);
            this.RegisterProject(1, "OpenGL Survillence System", "For my final project in university I had chosen to give myself a challenge by designing and developing a survillence system from scratch in C++ OpenGL to find techneques to improve upon the current survillence market. By doing this I'd learn't a lot about various communication protocols such as MotionJPEG and streaming the protocols across the network, creating user interface frameworks in OpenGL, and developing applications in C++ OpenGL.<br><br>https://github.com/callum1h3/CCTV/tree/main/CCTV/CCTV", 2, [
                '<p>One of the design choices of this system is giving the user the ability to build a virtual representation of a top down view of their building. So I had to develop a input system that allows the user to place objects in a 2D scrollable scene.<br><br>The scrollable interface was made by offseting the orthographic projection matrix that controls the position of all of the UI elements. The input system also needs to take this into account because not all of the user interface is scrollable so it needs to detect if its moveable.<\p><img src="./gifs/cctvbuilder.gif">',
                '<p>The program will automatically install the survillence software onto any device that has linux and SSH enabled, it achieves this by taking use of SSH to run all of the commands on the targeted machine.</p>'
            ]);

            this.RegisterProject(2, "Voxel Projects", "To gain more programming skills I had made various Voxel projects in C# Unity and later on in C++ OpenGL, this had taught me the fundamentals of creating safe multithreaded systems in both C#, C++ while also creating fast and efficent code to generate the voxelized terrain by using techniques such as bitwise compression and general optimization skills. I had alot of fun researching differents ways to better optimize my code and this helped me in the future to become better at optimizing my code for larger projects.", 2, [
                '<p>The C++ OpenGL version of the voxel project uses deferred rendering and multi threaded terrain and mesh generation to achieve the effect of this program.<br><br>I had also implemented frustum culling to lower the amount of chunks having to be rendered on the screen.</p><img src="./gifs/openglvoxel.gif">',
                '<p>In the Voxel C# Unity project I had taken use of the Burst library to create fast multithreaded code for both the mesh and terrain generation. I had to create a custom lit shader to be able to compress all of the vertex data required for the mesh into around 8 bytes due to the amount of voxels having to be rendered on the screen.</p><img src="./gifs/unityvoxel.gif">'
            ]);

            this.manager.EnableIFramePointerEvents();
        }

        this.Dispose = function(manager)
        {
            
        }
        
        this.OnLeftArrow = function()
        {
            this.isLeft = -150;
            this.SetProject(this.projectID - 1);
        }

        this.OnRightArrow = function()
        {
            this.isLeft = 150;
            this.SetProject(this.projectID + 1);
        }

        this.createdraw = function(doc, x1, y1, x2, y2) {
            const line = doc.createElement("line");
            line.style.position = "absolute";
            line.style.zIndex = 130;
            
            this.setLinePosition(line, x1, y1, x2, y2);
            this.setLineThickness(line, 4);
            this.setLineColor(line, 255,255,255);
            doc.body.appendChild(line);

            return line;
        }

        this.createInteractIcon = function(doc)
        {
            const img = doc.createElement("img");
            img.src = "../../images/dotcircle.png";
            img.style.cursor = "pointer";
            img.style.width = "32px";
            img.style.height = "32px";
            img.style.transform = "translate(-50%, -50%)"
            img.style.zIndex = -1;

            img.style.position = "absolute";
            this.setInteractPos(img, -100, -100);
            doc.body.appendChild(img);

            this.interactIcons.push(img);
            return img;
        }

        this.setInteractPos = function(element, x, y)
        {
            element.style.left = x + "px";
            element.style.top = y + "px";
        }

        this.setLineThickness = function(element, size)
        {
            element.style.height = "1px";
        }

        this.setLineColor = function(element, r, g, b)
        {
            element.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
        }

        this.setLinePosition = function(element, x1, y1, x2, y2)
        {
            if (x2 < x1) {
                var tmp;
                tmp = x2 ; x2 = x1 ; x1 = tmp;
                tmp = y2 ; y2 = y1 ; y1 = tmp;
            }
        
            var lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            var m = (y2 - y1) / (x2 - x1);
        
            var degree = Math.atan(m) * 180 / Math.PI;

            element.style.transformOrigin = "top left";
            element.style.transform = "rotate(" + degree + "deg)";
            element.style.width = lineLength + "px";
            element.style.top = y1 + "px";
            element.style.left = x1 + "px";
            
        }

        this.OnIFrameLoad = function()
        {
            var self = this;
            var iframe = document.getElementsByClassName('iFrameName')[0];

            var leftarrow = iframe.contentWindow.document.getElementsByClassName("leftarrow")[0];
            leftarrow.onclick = function() {self.OnLeftArrow()};

            var rightarrow = iframe.contentWindow.document.getElementsByClassName("rightarrow")[0];
            rightarrow.onclick = function() {self.OnRightArrow()};

            this.projectDesciption = iframe.contentWindow.document.getElementById("descriptiontext");

            this.interactLine = this.createdraw(iframe.contentWindow.document, -1, -1, -1, -1);
            this.interactLine2 = this.createdraw(iframe.contentWindow.document, -1, -1, -1, -1);

            this.interactContent = iframe.contentWindow.document.getElementById("interact");
            this.interactContent.style.left = -100;
            this.interactContent.style.top = -100;
            //this.interactContent.style.opacity = 0;
            //this.interactContent.innerHTML = "HI";

            this.titlename = iframe.contentWindow.document.getElementById("name");
            this.titlename.innerHTML = "EPIC";
            this.targetTitle = "EPIC";
            this.titleX = 0;
            this.isLeft = 150;
            this.lerpInteractHover = 0;
            this.interactIcons = [];
            this.interactPosition = {};
            
            iframe.contentWindow.document.onclick = function()
            {
                self.ResetInteract();
            }
            
            this.SetProject(0);
        }

        this.clearInteractIcons = function()
        {
            this.interactIcons.forEach(function(item, index, arr) {
                item.remove();
            });

            this.interactIcons = [];
        }

        this.SetProject = function(id)
        {
            if (this.isSettingProject)
                return;
            
            if (id < 0)
                return;

            if (id >= this.projects.length)
                return; 

            this.isSettingProject = true;
            this.isSettingProjectPhase1 = false;
            this.projectID = id;

            this.ResetInteract();

            this.clearInteractIcons();
        }

        this.SetTitle = function(name)
        {
            if (this.isSettingTitle)
                return;

            if (name == this.targetTitle)
                return;

            this.targetTitle = name;
            this.isSettingTitle = true;
        }

        this.SetTitleX = function(x)
        {
            this.titlename.style.transform = "translate("+x+"px,0)";
            this.titleX = x;
        }

        this.UpdatePosition = function()
        {
            if (this.isSettingProject && !this.isSettingProjectPhase1)
                return;

            if (this.projectID == null)
                return;

            var project = this.projects[this.projectID];
            this.manager.cameraTargetPosition(project.camera.position.x, project.camera.position.y, project.camera.position.z);
        }

        this.UpdateProject = function(deltatime)
        {
            if (!this.isSettingProject)
                return;

            var title_isleft = -this.isLeft * 4;

            if (this.isSettingProjectPhase1)
            {
                this.SetTitleX(lerp(this.titleX, 0, deltatime * 8));
                this.projectDesciption.style.opacity = lerp(this.projectDesciption.style.opacity, 1, deltatime * 16);

                if (Math.abs(this.titleX) > 0.1)
                    return;

                if (this.projectDesciption.style.opacity < 0.99)
                    return;

                this.projectDesciption.style.opacity = 1;
                this.SetTitleX(0);
                this.isSettingProject = false;

                return;
            }

            this.SetTitleX(lerp(this.titleX, title_isleft, deltatime * 4));
            this.projectDesciption.style.opacity = lerp(this.projectDesciption.style.opacity, 0, deltatime * 16);

            this.manager.cameraTargetPosition(this.manager.CAMERA_POS_X, this.manager.CAMERA_POS_Y, this.manager.CAMERA_POS_Z + -this.isLeft * 0.4);

            if (8 < Math.abs(this.titleX - title_isleft))
                return;

            if (this.manager.CAMERA_POS_Z > -this.isLeft * 0.9)
                return;

            if (this.projectDesciption.style.opacity > 0.01)
                return;

            var project = this.projects[this.projectID];
            
            this.projectDesciption.style.opacity = 0;
            this.titlename.innerHTML = project.title;
            this.SetTitleX(-title_isleft);
            this.projectDesciption.innerHTML = project.description;
            this.isSettingProjectPhase1 = true;   
            this.manager.cameraSetPosition(project.camera.position.x, project.camera.position.y, project.camera.position.z + (this.isLeft * 0.5));  

            var iframe = document.getElementsByClassName('iFrameName')[0];
            var self = this;
            for (let i = 0; i < project.nummarkers; i++)
            {
                var img = this.createInteractIcon(iframe.contentWindow.document);  

                img.onclick = function(data) {
                    self.OnInteractHover(img, i, data);
                };
            } 
        }

        this.OnInteractHover = function(img, id, data)
        {
            if (this.projectID == null)
                return;

            var project = this.projects[this.projectID];
            
            if (project == null)
                return;

            if (this.targetInteractHover != null)
                if (this.targetInteractHover.id == id)
                    return;

            var pos = this.interactPosition[id];

            if (pos == null)
                return;

            var scale_dir = new THREE.Vector2(1,-1);
                
            var x = pos.x;
            var y = pos.y;

            if (x > this.manager.screenW / 2)
                scale_dir.x = -1;

            if (y > this.manager.screenY / 2)
                scale_dir.y = 1;

            
            var endpos = new THREE.Vector2(
                pos.x + (scale_dir.x * 100),
                pos.y + (scale_dir.y * 100)
            )

            //this.targetScaleDir

            this.targetInteractHover = {
                img: img,
                id: id,
                endpos: endpos,
                scale_dir: scale_dir,
                html: project.interactdescs[id]
            }



            console.log("Selected Info.");
        }

        this.ResetInteract = function(quick)
        {
            if (quick)
            {
                this.targetInteractHover = null;
            }
            this.currentInteract = null;
            this.setLinePosition(this.interactLine, 0, 0, 0, 0);
            this.setLinePosition(this.interactLine2, 0, 0, 0, 0);

            var interac = $( this.interactContent );
            
            interac.css({
                'opacity'           : 0,
                'top'               : -1000,
                'left'              : -1000
              });

        }

        this.UpdateInteractionHover = function(deltatime)
        {
            if (this.interactLine == null)
                return;

            this.UpdateInteractionLerp(deltatime);

            if (this.targetInteractHover != null)
            {
                this.lerpInteractHover = lerp(this.lerpInteractHover, 0, deltatime * 10);
                
                if (this.lerpInteractHover < 0.02)
                {
                    this.lerpInteractHover = 0;
                    this.currentInteract = this.targetInteractHover;
                    this.targetInteractHover = null;

                    this.interactContent.innerHTML = this.currentInteract.html;
                    this.interactContent.style.left = this.currentInteract.endpos.x + "px";
                    this.interactContent.style.top = this.currentInteract.endpos.y + "px";

                    this.currentInteract.width = $( this.interactContent ).width() + 20;
                }

                return;
            }
            
            if (this.currentInteract != null)
            {
                this.lerpInteractHover = lerp(this.lerpInteractHover, 1, deltatime * 10);
            }   
        }

        this.UpdateInteractionLerp = function(deltatime)
        {
            if (this.currentInteract == null)
                return;    

            var startpos = this.interactPosition[this.currentInteract.id];

            if (startpos == null)
                return;

            var width = this.currentInteract.width;
            var endpos = this.currentInteract.endpos;

            var phase1 = clamp((this.lerpInteractHover - 0.25) * 4, 0, 1);
            var phase2 = clamp((this.lerpInteractHover - 0.5) * 2, 0, 1);
            var phase3 = clamp((this.lerpInteractHover - 0.75) * 4, 0, 1);

            var lerpLineEnd = new THREE.Vector2(
                lerp(startpos.x, endpos.x, phase1),
                lerp(startpos.y, endpos.y, phase1)
            );

            var lerpLineEnd2 = new THREE.Vector2(
                lerp(endpos.x, endpos.x + (width * this.currentInteract.scale_dir.x), phase2),
                endpos.y
            );
            
            var scale_x = clamp(this.currentInteract.scale_dir.x, -1, 0);
            var scale_y = 0;

    
            var interac = $( this.interactContent );

            var transform_val = "translate("+scale_x+"00%, "+scale_y+"00%)";

            interac.css({
                '-webkit-transform' : transform_val,
                '-moz-transform'    : transform_val,
                '-ms-transform'     : transform_val,
                '-o-transform'      : transform_val,
                'transform'         : transform_val,
                'opacity'           : phase3
              });
            
            this.setLinePosition(this.interactLine, startpos.x, startpos.y, lerpLineEnd.x, lerpLineEnd.y);
            this.setLinePosition(this.interactLine2, endpos.x, endpos.y, lerpLineEnd2.x, lerpLineEnd2.y);
        }

        this.UpdateInteraction = function()
        {
            if (this.projectID == null)
                return;

            var project = this.projects[this.projectID];

            for (let i = 0; i < project.nummarkers; i++)
            {
                var img = this.interactIcons[i];

                if (img == null)
                    continue;

                var interact = project.interacts[i];

                if (interact == null)
                    continue;

                var pos = new THREE.Vector3(0,0,0);
                pos.copy(interact.position);
           
                pos.project( this.manager.THREE_CAMERA );
                pos.x = ( pos.x + 1) * this.manager.screenW / 2;
                pos.y = - ( pos.y - 1) * this.manager.screenH / 2;
                pos.z = 0;

                this.interactPosition[i] = pos;
                this.setInteractPos(img, pos.x, pos.y);
            }
        }

        this.onKeyPress = function(key)
        {

        }

        this.onWheelEvent = function(wheel)
        {

        }

        this.Update = function(manager, deltatime, time)
        {
            const uniforms = this.background.material.uniforms;
            uniforms.u_time.value = time;

            this.UpdateProject(deltatime);
            this.UpdatePosition();
            this.UpdateInteraction();
            this.UpdateInteractionHover(deltatime);
        }

        this.onPointerMove = function(normalized)
        {
            
        }

        this.onPointerDown = function()
        {

        }

        this.GetSceneName = function()
        {
            return "Projects";
        }
    }
}

export { Projects };