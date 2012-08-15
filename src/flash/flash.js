(function(bm){

bm.FlashRT = bm.Class.extend({
  init:function(){
  
    this.flashObjID = Math.floor(Math.random()*16777215*16777215).toString(16);
    
  },
  start: function(){
  
    // By default the brassmonkey.swf is loaded off of our CDN. That can be overriden
    // to use another location such as a local version
    bm.options.swfURL = bm.options.swfURL ? bm.options.swfURL : 
      'http://s3.amazonaws.com/files.playbrassmonkey.com/sdks/js/v'+
      bm.version.replace(/\./g,'-')+'/brassmonkey.swf';
  },
  
  stop: function(){
    // TODO: Implement (Shutdown all connections etc.)
  },
  
  getFlashObject: function(){
    return document.getElementById(flashObjID);
  },
  
  showSlotColor: function(slot){
    console.log(slot);
  }
});

// Inject brassmonkey flash object into the web page
function initializeDOM(){
  // Make sure all the images for the controller have been loaded
  if(typeof bm.options.design == "string"){
    initializeFlash([]);
  } else if(bm.options.design.images.length==0){
    // If there are no images then initializeFlash right away
    initializeFlash([]);
  } else if(bm.detectInternetExplorerVersion()!=-1){
    // If we're in IE then use Flash to extract image data as IE
    // doesn't have the ability to get image data.
    // NOTE: IE9 may have support, will look into that soon enough.
  } else {
  
    bm.loadImages(bm.options.design.images,function(imageData){
      initializeFlash(imageData);
    });
  } 

  function getDataURL(img){
    var cvs = document.createElement('canvas'),
        ctx = cvs.getContext('2d');
    cvs.width = img.width;
    cvs.height = img.height;
    ctx.drawImage(img,0,0);
    
    var str = cvs.toDataURL().replace('data:image/png;base64,','');
    //console.log(str);
    return str;
  }

  function initializeFlash(imageData){
    
    // Add a div to the webpage that the brassmonkey flash bridge will go into.
      // Wrap that div again so we can do some styling trick to ensure that the swf object doesn't show up
      // as a single pixel. This is because swfobject.js replaces your div the <object> element
    var container = document.createElement('div');
    container.id="brassmonkey-wrapper"+Math.floor(Math.random()*16777215*16777215).toString(16);
      // Outter div
    document.body.appendChild(container);
    container.style.zIndex = 10000;
    container.style.position = "fixed";
    container.style.width="8px";
    container.style.height="8px";
    container.style.left="0px";
    container.style.bottom="0px";
    container.style.overflowX="hidden";
    container.style.overflowY="hidden";
      // Inner div that will replaced by the brassmonkey flash object
    var target = document.createElement('div');
    target.id="brassmonkey-wrapper"+Math.floor(Math.random()*16777215*16777215).toString(16);
    container.appendChild(target);
  
    
    // Now use swfobject.js to add our the brassmonkey flash object to the page
      // Our goal is to keep our flash version as low possible in order to potentially support
      // embedded systems like Google TV, PS3, Nintendo Wii's, or old Android Phone Browsers
      // that haven't or never will get newer versions of the flash run-time added to them.
    var swfVersionStr = "9.0.124";
      
    // Pass in our settings to flash.
    var flashvars = {
      // The display name of the game (The name that shows up on your phone)
      bmDeviceName:     bm.options.name,
      // The controller layout/resources serialized as XML.
      bmControllerXML:  encodeURIComponent(bm.generateControllerXML(imageData)),
      // Basic Flash vars
      wmode:            "window",
      debug:            "true"
    };
    
    // To prevent name collisions we alias bm to a randomly generated name.
    // This is to prevent name collisions later for existing codebases
    // that may also have their own global variable named 'bm'.
    // We will pass this name into flash so it knows which global
    // it can depend on to call into.
    // TODO: Still need to implement jQuery.noConflict() style function
    var bmGlobalName = Math.floor(Math.random()*16777215*16777215).toString(16)
    window['bm'+bmGlobalName] = bm;
    flashvars.globalName = bmGlobalName;
      
    // Generate us a unique device ID.
    // If one has been supplied to us (By this being loaded from within an iFrame on the website)
    // then use that one instead.
      // Are we embedded on the portal?
    if( bm.wereParams&&
        bm.getParams['appId']!==undefined&&
        bm.getParams['portalId']!==undefined){
        
      flashvars.bmDeviceId = bm.getParams['appId'];
      flashvars.bmPortalId = bm.getParams['portalId'];
        
    } else {  // Or are we standalone
      // If so generate our own random app/device ID
      //flashvars.bmDeviceId = "8f74e835162d";
      //flashvars.bmDeviceId = "8f74e835162d";
      flashvars.bmDeviceId = Math.floor(Math.random()*16777215*16777215).toString(16);
    }
    
    bm.deviceId = flashvars.bmDeviceId;
    
    // 
    flashvars.bmMaxPlayers=bm.options.bmMaxPlayers!==undefined?bm.options.bmMaxPlayers:96;
    
    
    var params = {};
    params.quality = "high";
    params.bgcolor = "#ffffff";
    params.allowscriptaccess = "always";
    params.allowfullscreen = "true";
    //params.bmPortalIP="ec2-174-129-99-8.compute-1.amazonaws.com";
    var attributes = {};
    attributes.id = bm.runtime.flashObjID;
    attributes.name = "Play Brass Monkey";
    attributes.align = "middle";
    attributes.style="float:left;z-index:-1;position:absolute;margin-top:-1px;"
    swfobject.embedSWF(
      bm.options.swfURL, target.id,
      "1", "1",
      swfVersionStr, "",
      flashvars, params, attributes,function(e){
        if( e.success===false&&
            bm.options.error!==undefined){
          bm.options.error("noflash");
        } else if( e.success===true&&
            bm.options.error!==undefined){
          bm.options.success();
        }
      });
  }
}

// If flash is going to be the runtime initialize it's flash object
if(bm.detectRuntime()=="flash"){
  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', initializeDOM, false);
  } else {
    window.attachEvent('onload', initializeDOM);
  }
}

})(BrassMonkey);