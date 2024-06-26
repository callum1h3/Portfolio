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
            this.background.setScreenSize(screenW, screenH);
        }

        this.Initialize = function(manager)
        {
            this.manager = manager;

            manager.THREE_SCENE.traverse(function(obj) 
            {
                if (obj.type != "Mesh")
                    return;

                var material = new THREE.MeshToonMaterial({
                    color: obj.material.color
                });

                 obj.material = material;
            })

            this.InitBackground();

            this.projects = [];
            this.RegisterProject(0, "Test Project", "Testing...", 2, ['EVEN COOLER!','EPIC']);
            this.RegisterProject(1, "2nd Test Project", "Epic", 0 );

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
            
            this.setLinePosition(line, x1, y1, x2, y2);
            this.setLineThickness(line, 4);
            this.setLineColor(line, 255,255,255);
            doc.body.appendChild(line);

            console.log(line);
        }

        this.createInteractIcon = function(doc)
        {
            const img = doc.createElement("img");
            img.src = "../../images/dotcircle.png";
            img.style.width = "32px";
            img.style.height = "32px";

            img.style.position = "absolute";
            this.setInteractPos(img, 300, 300);
            doc.body.appendChild(img);

            this.interactIcons.push(img);
            
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


            //this.linedraw(iframe.contentWindow.document.body, 0, 0, 500, 500);

            this.createdraw(iframe.contentWindow.document, 300, 0, 500, 500);

            this.titlename = iframe.contentWindow.document.getElementById("name");
            this.titlename.innerHTML = "EPIC";
            this.targetTitle = "EPIC";
            this.titleX = 0;
            this.isLeft = 150;
            this.interactIcons = [];
            
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
            for (let i = 0; i < project.nummarkers; i++)
                this.createInteractIcon(iframe.contentWindow.document);     
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

                var pos = new THREE.Vector3(0,0,0);
                pos.copy(interact.position);
           
                pos.project( this.manager.THREE_CAMERA );
                pos.x = ( pos.x + 1) * this.manager.screenW / 2;
                pos.y = - ( pos.y - 1) * this.manager.screenH / 2;
                pos.z = 0;
                
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