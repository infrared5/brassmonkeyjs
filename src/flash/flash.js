(function(){

bm.FlashRT = function(){
}


bm.FlashRT.prototype.start = function(options){

  // By default the brassmonkey.swf is loaded off of our CDN. That can be overriden
  // to use another location such as a local version
  bm.options.swfURL = options.swfURL ? options.swfURL : 
    'http://s3.amazonaws.com/files.playbrassmonkey.com/sdks/js/v'+
    bm.version.replace(/\./g,'-')+'/brassmonkey.swf';
}



var flashObjID = Math.floor(Math.random()*16777215*16777215).toString(16);
bm.getFlashObj = function(){
  return document.getElementById(flashObjID);
}

// Inject brassmonkey flash object into the web page
function initializeDOM(){
  // Make sure all the images for the controller have been loaded
  if(typeof bm.options.design == "string"){
    initializeFlash([]);
  } else if(bm.options.design.images.length==0){
    // If there are no images then initializeFlash right away
    initializeFlash([]);
  } else if(getInternetExplorerVersion()!=-1){
    // If we're in IE then use Flash to extract image data as IE
    // doesn't have the ability to get image data.
    // NOTE: IE9 may have support, will look into that soon enough.
  } else {
    var imagesLoaded = 0,
        imageData = new Array(bm.options.design.images.length);
    for(var i = 0;i<bm.options.design.images.length;i++){
      (function(){
        var j = i,
            img = new Image();
        img.onload=function(){
          
          imageData[j] = getDataURL(img);
          imagesLoaded++;
          if(imagesLoaded==bm.options.design.images.length){
            initializeFlash(imageData);
          }
        }
        img.src = bm.options.design.images[i];
      })();
    }
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
  
  function generateControllerXML(imageData){
    if(typeof bm.options.design == "string"){
      return bm.options.design;
    } else {
      var xml = encodeURIComponent(generateXMLFromJSON(bm.options.design,imageData));
      //console.log(xml);
      return xml;
    }
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
      bmControllerXML:  generateControllerXML(imageData),
      // Basic Flash vars
      wmode:            "window",
      debug:            "true"
    };
      
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
    attributes.id = flashObjID;
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

if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', initializeDOM, false);
} else {
  window.attachEvent('onload', initializeDOM);
}

// Convert from JSON Controller Schema format to the original XML way.
// TODO:  
//   - Add defaults for as many attributes as possible 
//     - (width/height): Use images natural width/height if not specified
//   - Figure out a way to make it so that resource indexes don't have to 
//     manually managed
//   - Unify button names and button handlers names.
function generateXMLFromJSON(json,imageData){
  function convertX(x){
    if(bm.options.design.orientation=="portrait"){
      x/=320.0;
    } else{
      x/=480.0;
    }
    return x;
  }
  function convertY(y){
    if(bm.options.design.orientation=="portrait"){
      y/=480.0;
    } else{
      y/=320.0;
    }
    return y;
  }

  var xml = '<?xml version="1.0" encoding="utf-8"?>\n'+
            '<BMApplicationScheme version="0.1" orientation="'+json.orientation+'" touchEnabled="'+(json.touchEnabled?'yes':'no')+'" accelerometerEnabled="'+(json.accelerometerEnabled?'yes':'no')+'">\n';
  
  // Create Resources Section
  if(imageData.length!=0){ 
    xml+= '<Resources>\n';
    for(var i = 0;i<imageData.length;i++){
      xml+='<Resource id="'+(i+1)+'" type="image">\n';
        xml+='<data><![CDATA['+imageData[i]+']]></data>\n';
      xml+='</Resource>\n';
    }  
    xml+= '</Resources>\n';
  } else {
    // No Resources were supplied
    xml+= '<Resources/>\n';
  }
  // Create Layout Section
  if(json.layout.length!=0){   
    xml+= '<Layout>\n';
    for(var i = 0;i<json.layout.length;i++){
      
      // NOTE: I ensure all DisplayObjects have handler attributes, but
      // this may not be necessary. Talk to Shaules/Zach to find out.
      // For now I do this so that users of the JS SDK don't need to provide something
      var handler = json.layout[i].handler;
      if(json.layout[i].type=="image"){
        handler = "nullHandler";
      }
    
      xml+='<DisplayObject type="'+json.layout[i].type+'" top="'+convertY(json.layout[i].y)+'" left="'+convertX(json.layout[i].x)+'" width="'+convertX(json.layout[i].width)+'" height="'+convertY(json.layout[i].height)+'" functionHandler="'+handler+'">\n';
      if(json.layout[i].type=="image"){
        xml+='<Asset name="up" resourceRef="'+(json.layout[i].image+1)+'" />\n';
      } else {
        xml+='<Asset name="up" resourceRef="'+(json.layout[i].imageUp+1)+'" />\n';
        xml+='<Asset name="down" resourceRef="'+(json.layout[i].imageDown+1)+'" />\n';
      }
      xml+='</DisplayObject>\n';
    }  
    xml+= '</Layout>\n';  
  } else {
    // No Layout was supplied
    xml+= '<Layout/>\n';
  }
  xml+='</BMApplicationScheme>';
  
  //xml = '<?xml version="1.0" encoding="utf-8"?><BMApplicationScheme version="0.1" orientation="landscape" touchEnabled="yes" accelerometerEnabled="no"><Resources /><Layout /></BMApplicationScheme>';
  //xml = //xml.replace(/\n/g,'');
  //console.log(xml);
  return xml;
}

})();