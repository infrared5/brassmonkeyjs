(function(){

// Create bm namespace
bm = {};
bm.version = "0.3.0"
bm.visible = true;

// Provide swfobject.js if it wasn't available. 
if(window["swfobject"]===undefined){
  brassmonkeySwfObject();
}

bm.init = function(options){
  bm.options = options;
  
  bm.options.logging = options.logging ? options.logging : false;
  
  // By default the brassmonkey.swf is loaded off of our CDN. That can be overriden to use another location such as local
  bm.options.swfURL = options.swfURL ? options.swfURL : 'http://s3.amazonaws.com/files.playbrassmonkey.com/sdks/js/v'+bm.version.replace(/\./g,'-')+'/brassmonkey.swf';
  
  bm.options.design.images =  options.design.images?options.design.images:[];
  bm.options.design.layout =  options.design.layout?options.design.layout:[];
  
  bm.getParams = {};
  bm.wereParams = false;
  document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
    function decode(s) {
      return decodeURIComponent(s.split("+").join(" "));
    }
    bm.getParams[decode(arguments[1])] = decode(arguments[2]);
    bm.wereParams=true;
  });
}

var slotColors = [
  "#ff6600","#ffcc00","#ff3399","#ff0066",
  "#cc00ff","#999900","#9999cc","#00cc99",
  "#287200","#00ccff","#003366","#99ff00",
  "#cc0000","#80cd68","#6600ff"
];

//--------------------------------------
// Public API
//-------------------------------------- 
var events = [
  'DeviceAvailable',
  'DeviceConnected',
  'DeviceDisconnected',
  'NavigationString',
  'KeyString',
  'Invocation',
  'ShakeReceived',
  'AccelReceived',
  'Log',
  'ShowSlot'
];

for(var i = 0; i<events.length;i++){
  createHookableFunction(events[i],events[i]!='AccelReceived'&&events[i]!='Log');
}

  // Utils
bm.log = function(str){
  if(bm.options.logging){
    bm.onLogInternal(str);
  }
}

//--------------------------------------
// Implementation
//-------------------------------------- 
function createHookableFunction(publicName,loggable){
  var CBs = [],
      onHook = function(cb){
        CBs.push(cb);
      };
  
  // Create Internal & Public versions
  bm['on'+publicName] = onHook;
  
  
  // This version is called directly by the BM JS and
  // flash internal implementations 
  bm['on'+publicName+"Internal"] = function(){
    if(loggable){
      bm.log('on'+publicName+'(');;
      for(var i=0;i<arguments.length;i++){
        bm.log('    '+JSON.stringify(arguments[i]));
      }
      bm.log(')');
    }
  
    // Super Hack for supporting first version of App's Old Navigation Events
    if(publicName=="NavigationString"){
      if( (arguments[1]=="left"||
          arguments[1]=="right"||
          arguments[1]=="up"||
          arguments[1]=="down"||
          arguments[1]=="back"||
          arguments[1]=="activate")&&
          !perDeviceAttributes[arguments[0]].hackForOldNavEventsEnabled ){
        var original = arguments[1];
        
        
        //alert(arguments[1]);
        for(var i = 0; i<CBs.length;i++){
          arguments[1]=original+"Down";
          try{
            CBs[i].apply(bm, arguments);
          } catch(e){
            console.log('UnhandledException ('+e+') in '+bmHooks[j]+' Callback');
          }
          arguments[1]=original+"Clicked";
          try{
            CBs[i].apply(bm, arguments);
          } catch(e){
            console.log('UnhandledException ('+e+') in '+bmHooks[j]+' Callback');
          }
        }
        arguments[1]=original+"Up";
      } else {
        perDeviceAttributes[arguments[0]].hackForOldNavEventsEnabled = true;
      }
    }
  
    for(var i = 0; i<CBs.length;i++){
      try{
        CBs[i].apply(bm, arguments);
      } catch(e){
        console.log('UnhandledException ('+e+') in '+bmHooks[j]+' Callback');
      }
    }
  }  
}

bm.showSlotInternal = function(slot){
  bm.onShowSlotInternal(slotColors[(Math.max(1, slot) - 1) % slotColors.length]);
}

/*
var controllers = {};
function getController(deviceId){
  if(deviceId){
    controllers['_'+deviceId] = {
      deviceId: deviceId,
      
    }
  }
}*/

// For Convenience we create a stable list of 
// [0,n] index values each associated with a
// controller via It's deviceId. This is useful
// things like making each controller have it's
// own cursor that uses the index to assign
// colors as controllers connect
var controllerSlotIndexes = [];

bm.getControllerSlot = function(deviceId){
  for(var i = 0; i<controllerSlotIndexes.length;i++){
    if(controllerSlotIndexes[i]==deviceId){
      return i;
    }
  }
};

bm.getControllerCount = function(){
  var count = 0;
  for(var i = 0; i<controllerSlotIndexes.length;i++){
    if(controllerSlotIndexes[i]!==undefined){
      count++;
    }
  }
  return count;
};

bm.getControllers = function (){
  var controllers = [];
  for(var i = 0; i<controllerSlotIndexes.length;i++){
    if(controllerSlotIndexes[i]!==undefined){
      controllers.push(controllerSlotIndexes[i]);
    }
  }
  return controllers;
};


var deviceNames = {};

bm.getDeviceName = function(deviceId){
  return deviceNames[deviceId];
}

var pingCBIntervals = {},
    perDeviceAttributes = {};

bm.onDeviceConnected(function(device){
  deviceNames[device.deviceId] = device.deviceName;
  perDeviceAttributes[device.deviceId] = {
    hackForOldNavEventsEnabled: false
  };

  // Assign the lowest indexed slot value
  for(var i = 0; i<controllerSlotIndexes.length;i++){
    if(controllerSlotIndexes[i]===undefined){
      controllerSlotIndexes[i] = device.deviceId;
      return;
    }
  }
  
  // Create a slot if all slots are filled.
  // This grows the list of slots as more controllers
  // connect.
  controllerSlotIndexes.push(device.deviceId);
  
/*
  pingCBIntervals[device.deviceId] = setInterval(function(){
    bm.setGamepadMode();
  },16);
*/
});
bm.onDeviceDisconnected(function(device){
  delete deviceNames[device.deviceId];
  delete perDeviceAttributes[device.deviceId];

  // Remove device from slots
  for(var i = 0; i<controllerSlotIndexes.length;i++){
    if(controllerSlotIndexes[i]==device.deviceId){
      controllerSlotIndexes[i] = undefined;
      break;
    }
  }
  
  // For robustness, show website if no controllers are connected
  if(bm.getControllerCount()==0){
    //document.getElementById("brassmonkey").setVisibility(true,true);
  }
  
/*
  clearInterval(pingCBIntervals[device.deviceId]);
  pingCBIntervals[device.deviceId] = undefined;
*/
});

bm.isDeviceConnected = function (device){
  if(deviceNames[device.deviceId] == undefined){
    return false;
  }
  return true;
};

var touchCBs = [];
bm.onTouchesReceived = function(cb){
  touchCBs.push(cb);
}
bm.onTouchesReceivedInternal = function(touchEvent){
  for(var i =0; i<touchEvent.touches.length;i++){
    var touch = touchEvent.touches[i];
    for(var cb = 0; cb<touchCBs.length; cb++){
      touchCBs[cb](touch,touchEvent.deviceId);
    }  
  }
}

bm.onSocketReady = function(){

}

bm.setNavMode = function(deviceId){
  if( document.getElementById("brassmonkey")&&
      document.getElementById("brassmonkey").SetNavMode!==undefined){
      
    var send = {
      deviceId: typeof deviceId==='undefined'?"":deviceId
    }
      
    document.getElementById("brassmonkey").SetNavMode(send.deviceId);
  }
};
bm.setKeyboardMode = function(deviceId,text){
  if( document.getElementById("brassmonkey")&&
      document.getElementById("brassmonkey").SetKeyboardMode!==undefined){
    
    var send = {
      deviceId: typeof deviceId==='undefined'?"":deviceId,
      text: typeof text==='undefined'?"":text
    }
    document.getElementById("brassmonkey").SetKeyboardMode(send.deviceId,send.text);
  }
};
bm.setGamepadMode = function(deviceId){
  if( document.getElementById("brassmonkey")&&
      document.getElementById("brassmonkey").SetGamepadMode!==undefined){;
    var send = {
      deviceId: typeof deviceId==='undefined'?"":deviceId
    }
    
    document.getElementById("brassmonkey").SetGamepadMode(send.deviceId);
  }
};
bm.setVisibility = function(visible){
  if( document.getElementById("brassmonkey")&&
      document.getElementById("brassmonkey").SetVisibility!==undefined){
      
    if(bm.visible==visible){
      return;
    }
    document.getElementById("brassmonkey").SetVisibility(visible,true);
    bm.visible = visible;
  }
}

bm.getVisibility = function(){
  return bm.visible;
}

bm.enableAccelerometer = function(deviceId,enabled,intervalSeconds){
  setTimeout(function(){
    document.getElementById("brassmonkey").EnableAccelerometer(deviceId,enabled,intervalSeconds);
  },2000);
}

bm.enableTouch = function(deviceId,enabled,intervalSeconds){
  setTimeout(function(){
    document.getElementById("brassmonkey").EnableTouch(deviceId,enabled,intervalSeconds);
  },2000);
}

bm.getWidth = function(){
  if( window.parent.passingObj!==undefined&&
      window.parent.passingObj['width']!==undefined){
    return window.parent.passingObj['width'];
  } else {
    return -1;
  }
}

bm.getHeight = function(){
  if( window.parent.passingObj!==undefined&&
      window.parent.passingObj['height']!==undefined){
    return window.parent.passingObj['height'];
  } else {
    return -1;
  }
}

bm.getFullscreen = function(){
  if( window.parent.passingObj!==undefined&&
      window.parent.passingObj['fullScreen']!==undefined){
    return window.parent.passingObj['fullScreen'];
  } else {
    return false;
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

function initializeDOM(){
  // Make sure all the images for the controller have been loaded
  if(typeof bm.options.design == "string"){
    initializeFlash([]);
  } else if(bm.options.design.images.length==0){
    // If there are no images then initializeFlash right away
    initializeFlash([]);
  } else if(checkForIE()!=-1){
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
    // Inject a div to inject the brassmonkey flash bridge into
    // Wrap that div again so we can do some styling trick to 
    // ensure that the swf object doesn't show up as a single pixel.
    // This is because swfobject.js replaces your div the <object> element
    var wrapperWrapper = document.createElement('div');
    wrapperWrapper.id="brassmonkey-wrapper"+Math.floor(Math.random()*16777215*16777215).toString(16);
    document.body.appendChild(wrapperWrapper);
    //wrapperWrapper.style = "position: fixed; width: 8px; height: 8px; bottom: 0px; left: 0px; overflow-x: hidden; overflow-y: hidden;";
    wrapperWrapper.style.zIndex = 10000;
    wrapperWrapper.style.position = "fixed";
    wrapperWrapper.style.width="8px";
    wrapperWrapper.style.height="8px";
    wrapperWrapper.style.left="0px";
    wrapperWrapper.style.bottom="0px";
    wrapperWrapper.style.overflowX="hidden";
    wrapperWrapper.style.overflowY="hidden";
    
    var wrapper = document.createElement('div');
    wrapper.id="brassmonkey-wrapper"+Math.floor(Math.random()*16777215*16777215).toString(16);
    wrapperWrapper.appendChild(wrapper);
  
    //<textarea id="brassmonkey-log"></textarea>
    //appendChild(mytext)
    
    //-------------------------------------------
    // Use swfobject.js to actually create it
    // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
    var swfVersionStr = "9.0.124";
    // To use express install, set to playerProductInstall.swf, otherwise the empty string.
    var flashvars = {
          bmDeviceName:     bm.options.name,
          wmode:            "window",
          debug:            "true",
          bmControllerXML:  generateControllerXML(imageData)
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
    
    var params = {};
    params.quality = "high";
    params.bgcolor = "#ffffff";
    params.allowscriptaccess = "always";
    params.allowfullscreen = "true";
    //params.bmPortalIP="ec2-174-129-99-8.compute-1.amazonaws.com";
    var attributes = {};
    attributes.id = "brassmonkey";
    attributes.name = "Play Brass Monkey";
    attributes.align = "middle";
    attributes.style="float:left;z-index:-1;position:absolute;margin-top:-1px;"
    swfobject.embedSWF(
      bm.options.swfURL, wrapper.id,
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

function generateXMLFromJSON(json,imageData){
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

// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
function getInternetExplorerVersion(){
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

function checkForIE()
{
  var ver = getInternetExplorerVersion();
  return ver;
}

})();