(function(){

/**
The Brass Monkey SDK. This is a singleton accessed like so:

    bm.init(…);
    
or

    bm.init(...);

@class BrassMonkey
@static
**/

bm = {};

/**
Version number of the SDK. 

Format:

    Major.Minor.Patch

Example:

    "0.5.1"
    
Follows the [Semantic Versioning Specification.](http://semver.org)

@property version 
@type String
**/
bm.version: "0.5.0";

// Constants
bm.MODE_GAMEPAD=0;	
bm.MODE_KEYBOARD=1;		
bm.MODE_NAVIGATION=2;		
bm.MODE_WAIT=3;

/**
Initialize Brass Monkey

@method init
@param {Object} options Options 
  for initializing Brass Monkey.
  @param {String} options.name The name of your game. This is what 
    is displayed on the phone when you pick what to connect to.
    
    Example: "Contamination"
  @param {String} options.appID The unique identifier of your Game/App. You
    must generate this through the developer admin interface.
    
  @param {Number} [options.maxPlayers=1]
    The number of players that can play your game.
    
  @param {URL} [options.swfURL]
    The location of the SWF file that implements 
    the SDK when there a browser doesn't support Websockets. 
    
    If not provided the matching version on the Brass Monkey CDN is used.
**/
bm.init = function(options){
  // TODO: Add defaults to these options for those not provided.
  bm.options = options;
  
  // By default the brassmonkey.swf is loaded off of our CDN. That can be overriden
  // to use another location such as a local version
  bm.options.swfURL = options.swfURL ? options.swfURL : 
    'http://s3.amazonaws.com/files.playbrassmonkey.com/sdks/js/v'+
    bm.version.replace(/\./g,'-')+'/brassmonkey.swf';
  
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

//--------------------------------------
// Public API
//-------------------------------------- 
var events = [
  'DeviceConnected',
  'DeviceDisconnected',
  'NavigationString',
  'KeyString',
  'Invocation',
  'ShakeReceived',
  'AccelReceived',
  'Log',
  "ShowSlot"
];

for(var i = 0; i<events.length;i++){
  var hookable = createHookableFunction(events[i],events[i]!='AccelReceived'&&events[i]!='Log');
  bm['on'+events[i]] = hookable.register;
  bm['on'+events[i]+"Internal"] = hookable.internal;
}

// onDeviceAvailable
var onDeviceAvailable = createHookableFunction(events[i],events[i]!='AccelReceived'&&events[i]!='Log');
bm.onDeviceAvailable = function(cb){
  onDeviceAvailable.register(cb);
}

bm.onDeviceAvailableInternal = function(device){
  device.controlMode=bm.MODE_NAVIGATION;
  onDeviceAvailable.internal(device);
  return device;
}

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

bm.getDeviceName = function(deviceId){
  return perDeviceAttributes[deviceId].deviceName;
}




//--------------------------------------
// Implementation
//-------------------------------------- 

bm.onDeviceConnected(function(device){
  perDeviceAttributes[device.deviceId] = {
    hackForOldNavEventsEnabled: false,
    deviceName:device.deviceName
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
});

bm.onDeviceDisconnected(function(device){
  delete perDeviceAttributes[device.deviceId];
  
  // Remove device from slots
  for(var i = 0; i<controllerSlotIndexes.length;i++){
    if(controllerSlotIndexes[i]==device.deviceId){
      controllerSlotIndexes[i] = undefined;
      break;
    }
  }
});

function createHookableFunction(publicName,loggable){
  // Generate function for registering listeners
  var CBs = [];
  function registerListener(cb){
    CBs.push(cb);
  };
   
  // Generate function that flash bridge should call
  function internal(){
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
  
  return {register:registerListener,internal:internal};
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

/**---------------------------------------------------------------------------------------
Enumerate Events here. I (Francois) tried to put these in events.js but couldn't get 
them to properly associate with the BrassMonkey Class.
---------------------------------------------------------------------------------------**/

/**
Event called when a mobile device successfully established a connection.

@event deviceavailable
@param {DeviceAvailableEvent} event
**/

/**
Event called when a mobile device successfully established a connection.

@event deviceconnected
@param {DeviceConnectedEvent} event
**/

/**
Event called when a mobile device is disconnected.

@event devicedisconnected
@param {DeviceDisconnectedEvent} event
**/

/**
Event called when a mobile device is disconnected.

@event devicedisconnected
@param {DeviceDisconnectedEvent} event
**/



})();