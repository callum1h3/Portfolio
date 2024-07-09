import { SceneManager, SceneModel, SceneContainer } from '../SceneManager.js';
import * as THREE from "../three.module.js";

function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const charactersLength = characters.length;
function textTransition(element, remainingText, currenttext)
{
    if (remainingText.length < 1)
    {
        element.innerHTML = currenttext;
        return;
    }

    currenttext += remainingText[0];
    remainingText = remainingText.slice(1);

   
    
    element.innerHTML = currenttext;
    element.innerHTML += characters.charAt(Math.floor(Math.random() * charactersLength));
    element.innerHTML += characters.charAt(Math.floor(Math.random() * charactersLength));
    element.innerHTML += characters.charAt(Math.floor(Math.random() * charactersLength));

    setTimeout(function() {
        textTransition(element, remainingText, currenttext);
    }, 22);
}


class TextTransitionContainer
{
    constructor(iframe, elementname)
    {
        this.element = iframe.contentWindow.document.getElementById(elementname);
        this.text = this.element.innerHTML;
        this.element.innerHTML = "";

        this.Start = function()
        {
            textTransition(this.element, this.text, "");
        }

        this.Reset = function()
        {
            this.element.innerHTML = "";
        }
    }
}

class Page1
{
    constructor()
    {
        var iframe = document.getElementsByClassName('iFrameName')[0];

        this.container = iframe.contentWindow.document.getElementById("page1");
        this.container.style.opacity = 0;
        
        this.firstTitle = new TextTransitionContainer(iframe, "titlelarge");
        this.secondTitle = new TextTransitionContainer(iframe, "titlesub");

        //this.profile = $(iframe.contentWindow.document.getElementById("profile"));

        this.Start = function(self)
        {
            this.firstTitle.Start();
            this.secondTitle.Start();
            console.log("Page Started!");
        }

        this.Update = function(self, deltatime)
        {
            //var x = (1 - self.currentLerp) * 400;
            //console.log(x);
            //this.profile.offset({top: 0, right:x});

            this.container.style.opacity = self.currentLerp;
        }

        this.Reset = function()
        {
            this.container.style.opacity = 0;
            this.firstTitle.Reset();
            this.secondTitle.Reset();
        }
    }
}

class Page2
{
    constructor()
    {
        var iframe = document.getElementsByClassName('iFrameName')[0];

        this.container = iframe.contentWindow.document.getElementById("page2");
        this.container.style.opacity = 0;

        this.Start = function(self)
        {

        }

        this.Update = function(self, deltatime)
        {
            this.container.style.opacity = self.currentLerp;
        }

        this.Reset = function()
        {
 
        }
    }
}

class About extends SceneContainer
{
    constructor()
    {
        super();

        this.manager = null;
        this.currentPage = null;
        this.currentPageNum = 0;
        this.currentLerp = 0;
        this.onIframe = false;
        this.isClosing = false;
        this.hasStarted = false;



        this.Initialize = function(manager)
        {
            this.manager = manager;

            this.manager.EnableIFramePointerEvents();
        }

        this.Dispose = function(manager)
        {
            
        }

        this.OnIFrameLoad = function()
        {
            var self = this;
            this.currentLerp = 0;

            setTimeout(function() {
                self.onIframe = true;
            }, 2000);

            this.pages = [
                new Page1(),
                new Page2()
            ];

            this.currentPageNum = 0;
            this.currentPage = this.pages[this.currentPageNum];

            var iframe = document.getElementsByClassName('iFrameName')[0];
            //var downbutton = iframe.contentWindow.document.getElementById("downbtn");
            //downbutton.onclick = function() { self.SetPage(self.currentPageNum + 1); }
        }

        this.onKeyPress = function(key)
        {

        }

        this.OnResize = function(screenW, screenH)
        {

        }

        this.onWheelEvent = function(wheel)
        {
            console.log(wheel);
        }

        this.Update = function(manager, deltatime, time)
        {
            this.UpdatePages(deltatime);
        }

        this.onPointerMove = function(normalized)
        {
            
        }

        this.onPointerDown = function()
        {

        }

        this.GetSceneName = function()
        {
            return "About";
        }

        this.SetPage = function(num)
        {
            if (num > this.pages)
                return;

            if (num < 0)
                return;

            this.currentPageNum = num;
            this.isClosing = true;


            console.log("switching to page:" + num);
        }

        this.UpdatePages = function(deltatime)
        {
            if (!this.onIframe)
                return;

            var target = 1;
            if (this.isClosing)
                target = 0;

            this.currentLerp = lerp(this.currentLerp, target, deltatime * 10);

            if (this.isClosing && this.currentLerp < 0.02)
            {
                if (this.currentPage != null)
                    this.currentPage.Reset();

                this.isClosing = false;
                this.currentPage = this.pages[this.currentPageNum];
            }

            if (!this.hasStarted && this.currentLerp > 0.98 )
            {
                this.currentPage.Start(this);
                this.hasStarted = true;
            }

            this.currentPage.Update(this, deltatime);
        }
    }
}

export { About };