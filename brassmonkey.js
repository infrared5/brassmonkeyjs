(function(){

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
// The base Class implementation (does nothing)
function Class(){};

// Create a new Class that inherits from this class
Class.extend = function(prop) {
  var _super = this.prototype;
  
  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  initializing = true;
  var prototype = new this();
  initializing = false;
  
  // Copy the properties over onto the new prototype
  for (var name in prop) {
    // Check if we're overwriting an existing function
    prototype[name] = typeof prop[name] == "function" && 
      typeof _super[name] == "function" && fnTest.test(prop[name]) ?
      (function(name, fn){
        return function() {
          var tmp = this._super;
          
          // Add a new ._super() method that is the same method
          // but on the super-class
          this._super = _super[name];
          
          // The method only need to be bound temporarily, so we
          // remove it when we're done executing
          var ret = fn.apply(this, arguments);        
          this._super = tmp;
          
          return ret;
        };
      })(name, prop[name]) :
      prop[name];
  }
  
  // The dummy class constructor
  function Class() {
    // All construction is actually done in the init method
    if ( !initializing && this.init )
      this.init.apply(this, arguments);
  }
  
  // Populate our constructed prototype object
  Class.prototype = prototype;
  
  // Enforce the constructor to be what we expect
  Class.prototype.constructor = Class;

  // And make this class extendable
  Class.extend = arguments.callee;
  
  return Class;
};


/**
EventEmitter implements an interface for registering, unregistering, and triggering events.

@class bm.EventEmitter
**/
EventEmitter = Class.extend({
  init:function(){
    this.callbacks = {};
  },
  /**
  Register a callback for a particular event.
  
  @method addEventListener
  @param {String} eventType Which event to listen to.
    Examples: 
        
        "buttondown", "buttonup", or "shake"
        
        
  @param {Function} fn Function to be called back when the event occurs.
  
  **/

  addEventListener: function(eventType,fn){
    if (typeof fn !== 'function'){
      throw new Error('.on() callback provided was not a function');
    }
  
    // Make an array for this particular eventName
    if(this.callbacks[eventType]===undefined){
      this.callbacks[eventType] = [];
    }
  
    // TODO: Is there any cheap way to detect duplicates.
    this.callbacks[eventType].push(fn);  
  },

  /**
  Alias for {EventEmitter.addEventListener}
  
  @method on
  **/
  on:function(eventType,fn){
    this.addEventListener(eventType,fn);
  },

  /**
  Unregister a callback for a particular event.
  
  @method removeEventListener
  @param {String} eventType Which event to stop listening to.
  @param {Function} fn Function to be removed.
  
  **/
  
  removeEventListener: function(eventType,fn){
    // Remove the callback from the list of listeners for the
    // respective eventType
    if(this.callbacks[eventType]!==undefined){
      var i,callbacks = this.callbacks[eventType];
      for(var i = 0; i<callbacks.length;i++){
        if(callbacks[i]==fn){
          callbacks.splice(i,1);
          return;
        }
      }
    }
  },
  
  /**
  Alias for {EventEmitter.removeEventListener}
  
  @method off
  **/
  off: function(eventType,fn){
    this.removeEventListener(eventType,fn);
  },
  
  /**
  Trigger an event. (Calls all the callbacks that are listening for the eventType)
  
  @method trigger
  @param {String} eventType Which event to trigger.
  @param {Event} event Event that will be passed to all registered listeners.
  
  **/
  trigger: function(eventType,event){
    if(this.callbacks[eventType]!==undefined){
      var i,callbacks = this.callbacks[eventType];
      for(var i = 0; i<callbacks.length;i++){
        callbacks[i](event);
      }
    }
  },
  
  /**
  Convenience function that adds .type field to the event reflecting which type the event is and then passes it to trigger().
  
  @method triggerWithType
  @param {String} eventType Which event to trigger. 
  
    Appends to the event as a field called .type (event.type=eventType).
    
  @param {Event} event Event that will be passed to all registered listeners.
  
  **/
  // 
  triggerWithType: function(eventType,event){
    event.type = eventType;
    this.trigger(eventType,event);
  }
});

var getQueryParams = function(qs) {
    qs = qs.split("+").join(" ");
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
};

/**
The Brass Monkey SDK. This is a singleton accessed like so:

    bm.init(...);
    
or

    var version = bm.version;

@class bm
@extends bm.EventEmitter
@static
**/

// Create the BrassMonkey global object. (Give it a short alias of 'bm' also)
// TODO:  Make a function similar to jQuery.noConflict(). I've already had
//        issues with collisions on a global bm. object when working with Game Maker
//        generated game projects.

var BrassMonkeyClass = EventEmitter.extend({
  init:function(){
    this._super();
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
    this.version = "0.5.0";
    
    
    this.devices = {};
  },
 /**
  Startup Brass Monkey
  
  @method start
  @param {Object} options Options 
    for initializing Brass Monkey.
    @param {String} options.name The name of your game. This is what 
      is displayed on the phone when you pick what to connect to.
      
      Example: "Monkey Golf"
    @param {String} options.appID The unique identifier of your Game/App. You
      must generate this through the developer admin interface.
      
    @param {Number} [options.maxPlayers=1]
      The number of players that can play your game.
      
      (Defaults to single player only.)
      
    @param {URL} [options.swfURL]
      The location of the SWF file that implements the SDK when there a browser doesn't support Websockets. (Used by the flash implementation if it is chosen at )
      
      (If not provided the matching version on the Brass Monkey CDN is used.)
  **/
  start: function(options){
    
    // Store options for convenient access later
      // TODO: Add defaults to these options for those not provided.
    this.options = options;
      // If no images/layout were provided we default them to being empty arrays.
      // This could be the case for when certain hosts like the website only
      // use the built in controllers (Keyboard Mode, Navigation Mode, and any future
      // ones)
    //bm.options.design.images =  options.design.images?options.design.images:[];
    //bm.options.design.layout =  options.design.layout?options.design.layout:[];
    
    var getParams = getQueryParams(document.location.search);
    options.deviceId = getParams.appId || Math.floor(Math.random()*16777215*16777215).toString(16);
    options.portalId = getParams.portalId;
    
    // Choose the proper communication runtime based on the environment.
    // For now it's basically WebSockets in Mobile Safari otherwise Flash
    // everywhere else.
    if(bm.detectRuntime()=="websockets"){
      this.runtime = new bm.WebSocketsRT();
    } else {
      this.runtime = new bm.FlashRT();
    }
    
    this.runtime.start(options);
  },
  
  /**
  Shutdown Brass Monkey
  
  This will close all open network connections and disconnect all controllers.
  
  @method stop
  **/
  stop: function(){
    if(bm.runtime!==undefined){
      bm.runtime.stop();
    }
  },
  
  /**
  Log to Brass Monkey's console.
  
  TODO: Implement a proper built cross browser debug pannel. For now uses built in console.log 
        where it's available.
  
  @method log
  **/
  log: function(str){
    return;
    if( console!==undefined&&
        console.log!==undefined){
      console.log.apply(console,arguments);
    }
  },
  
  addDevice: function(device){
    this.devices[device.id] = device;
    
    this.triggerWithType('deviceconnected', {device: device});
  },
  
  removeDevice: function(device){
    if(device.id in this.devices) {
      delete this.devices[device.id];
      this.triggerWithType('devicedisconnected', {device: device});
    }
  },
  
  getDevice: function(id){
    return this.devices[id];
  }
});

// Create singleton instance of BrassMonkey
bm = BrassMonkey = new BrassMonkeyClass();

// Add EventEmitter to the BrassMonkey namespace
bm.EventEmitter = EventEmitter;
bm.Class = Class;

/**
Log to Brass Monkey's console.

TODO: Implement a proper built cross browser debug pannel. For now uses built in console.log 
      where it's available.

@method log
**/

if(console!==undefined && console.log!==undefined) {
  bm.log = function() {console.log.apply(console,arguments);};
} else {
  bm.log = function() {};
}

window['boomBa'] = function(slot){
  console.log(slot);
}

var makeMethodProxy = function(devices, methodName) {
  return function() {
    for(var deviceId in devices) {
      if(devices.hasOwnProperty(deviceId)) {
        var device = devices[deviceId];
        device[methodName].apply(device, arguments);
      }
    }
  };
};

bm.allDevices = (function() {
  var proxy = {},
      devices = bm.devices,
      methods = ["setMode", "enableTouch"];

  for(var i = 0; i < methods.length; ++i) {
    proxy[methods[i]] = makeMethodProxy(devices, methods[i]);
  }

  return function() {
    return proxy;
  };
})();

// Constants
/*
bm.MODE_GAMEPAD=0;	
bm.MODE_KEYBOARD=1;		
bm.MODE_NAVIGATION=2;		
bm.MODE_WAIT=3;
*/

/*---------------------------------------------------------------------------------------
Enumerate Events here. I (Francois) tried to put these in events.js but couldn't get 
yuidoc to properly associate with the BrassMonkey Class.
---------------------------------------------------------------------------------------*/

/**
Event called when a mobile device successfully established a connection.

@event deviceavailable
@param {String} type Which event this is. Ie. **"deviceavailable"**
@param {bm.Device} device Device that generated this event.
**/

/**
Event called when a mobile device successfully established a connection.

@event deviceconnected
@param {String} type Which event this is. Ie. **"deviceconnected"**
@param {bm.Device} device Device that generated this event.
**/

/**
Event called when a mobile device is disconnected.

@event devicedisconnected
@param {String} type Which event this is. Ie. **"devicedisconnected"**
@param {bm.Device} device Device that generated this event.

**/

/**
Event called when the SDK has received it's assigned slot index/color.

This is the unique color that is displayed in top right of the console, in your game, and 
on the device list in the controller app. It's used to help users disambiguate which
console/game they want to connect to, if there is more than one on their network.

@event showslotcolor
@param {String} type Which event this is. Ie. **"showslotcolor"**
@param {Number} slot Unique identifier to your network. (Each instance of Brass Monkey running get it's own slot number assigned.)

@param {String} color Color to display on the screen. (CSS Style Hexidecimal)
    
    Example:
    
        "#ff0000"
             
**/

// Lookup table for converting slot index numbers into an agreed upon matching color.
bm.slotColors = [
  "#ff6600","#ffcc00","#ff3399","#ff0066",
  "#cc00ff","#999900","#9999cc","#00cc99",
  "#287200","#00ccff","#003366","#99ff00",
  "#cc0000","#80cd68","#6600ff"
];

/*    
this.slot = (Math.max(1, this.slot) - 1) % slotColors.length;
this.color = slotColors[this.slot];
*/

/**
Event representing the latest accelerometer values.

**Note:** 

  Accelerometer events must be enabled (See [Device.enableAccelerometer](bm.Device.html#method_enableAccelerometer)) and are sent continuously on the interval specified by [Device.setAccelerometerInterval](bm.Device.html#method_setAccelerometerInterval).

@event acceleration
@param {String} type Which event this is. Ie. **"acceleration"**
@param {bm.Device} device Device that generated this event.
**/

/**
Event representing the latest gyroscope values.

**Note:** 

  Gyroscope events must be enabled (See [Device.enableGyroscope](bm.Device.html#method_enableGyroscope)) and are sent continuously on the interval specified by [Device.setGyroscopeInterval](bm.Device.html#method_setGyroscopeInterval).

@event gyroscope
@param {String} type Which event this is. Ie. **"gyroscope"**
@param {bm.Device} device Device that generated this event.
@param {Object} gyroscope X/Y/Z angular momentum of the device.
    @param {Float} gyroscope.x X

    @param {Float} gyroscope.y Y
      
    @param {Float} gyroscope.z Z
**/

/**
Event representing the latest orientation values.

**Note:** 

  Orientation events must be enabled (See [Device.enableOrientation](bm.Device.html#method_enableOrientation)) and are sent continuously on the interval specified by [Device.setOrientationInterval](bm.Device.html#method_setOrientationInterval).

@event orientation
@param {String} type Which event this is. Ie. **"orientation"**
@param {bm.Device} device Device that generated this event.
@param {Object} orientation Orientation of the device as a Quaternion.
    @param {Float} orientation.x X

    @param {Float} orientation.y Y
      
    @param {Float} orientation.z Z
    
    @param {Float} orientation.w W
**/


/**
Event called when a button was pressed down.

@event buttondown
@param {String} type Which event this is. Ie. **"buttondown"**
@param {bm.Device} device Device that generated this event.
**/

/**
Event called when a button was released.

@event buttonup
@param {String} type Which event this is. Ie. **"buttonup"**
@param {bm.Device} device Device that generated this event.
**/

/**
Event called when a touch has started.

@event touchstart
@param {String} type Which event this is. Ie. **"touchstart"**
@param {bm.Device} device Device that generated this event.
@param {Number} x X coordinate of the touch (In pixel units).
@param {Number} y Y coordinate of the touch (In pixel units).
@param {String} id Unique identified for this touch.
**/

/**
Event called when a touch has moved.

@event touchmove
@param {String} type Which event this is. Ie. **"touchmove"**
@param {bm.Device} device Device that generated this event.
@param {Number} x X coordinate of the touch (In pixel units). 
@param {Number} y Y coordinate of the touch (In pixel units).
@param {String} id Unique identified for this touch.
**/

/**
Event called when a finger has been lifted up.

@event touchend
@param {String} type Which event this is. Ie. **"touchend"**
@param {bm.Device} device Device that generated this event.
@param {String} id Unique identified for this touch.
**/

/**
Event indicating the user shook their device.

**Note:** Accelerometer/Gyroscope events do not need to enabled, shake events do not take much network traffic so this was unnecessary.

@event shake
@param {String} type Which event this is, Ie. **"shake"**
@param {bm.Device} device Device that generated this event.
**/

})();
/*
Copyright (c) 2008 Fred Palmer fred.palmer_at_gmail.com

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
(function(bm) {

function StringBuffer()
{
    this.buffer = [];
}

StringBuffer.prototype.append = function append(string)
{
    this.buffer.push(string);
    return this;
};

StringBuffer.prototype.toString = function toString()
{
    return this.buffer.join("");
};

var Base64 =
{
    codex : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    encode : function (input)
    {
        var output = new StringBuffer();

        var enumerator = new Utf8EncodeEnumerator(input);
        while (enumerator.moveNext())
        {
            var chr1 = enumerator.current;

            enumerator.moveNext();
            var chr2 = enumerator.current;

            enumerator.moveNext();
            var chr3 = enumerator.current;

            var enc1 = chr1 >> 2;
            var enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            var enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            var enc4 = chr3 & 63;

            if (isNaN(chr2))
            {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3))
            {
                enc4 = 64;
            }

            output.append(this.codex.charAt(enc1) + this.codex.charAt(enc2) + this.codex.charAt(enc3) + this.codex.charAt(enc4));
        }

        return [enumerator.byteCount, output.toString()];
    },

    decode : function (input)
    {
        var output = new StringBuffer();

        var enumerator = new Base64DecodeEnumerator(input);
        while (enumerator.moveNext())
        {
            var charCode = enumerator.current;

            if (charCode < 128)
                output.append(String.fromCharCode(charCode));
            else if ((charCode > 191) && (charCode < 224))
            {
                enumerator.moveNext();
                var charCode2 = enumerator.current;

                output.append(String.fromCharCode(((charCode & 31) << 6) | (charCode2 & 63)));
            }
            else
            {
                enumerator.moveNext();
                var charCode2 = enumerator.current;

                enumerator.moveNext();
                var charCode3 = enumerator.current;

                output.append(String.fromCharCode(((charCode & 15) << 12) | ((charCode2 & 63) << 6) | (charCode3 & 63)));
            }
        }

        return output.toString();
    }
};


function Utf8EncodeEnumerator(input)
{
    this._input = input;
    this._index = -1;
    this._buffer = [];
    this.byteCount = 0;
}

Utf8EncodeEnumerator.prototype =
{
    current: Number.NaN,

    moveNext: function()
    {
        if (this._buffer.length > 0)
        {
            this.current = this._buffer.shift();
            return true;
        }
        else if (this._index >= (this._input.length - 1))
        {
            this.current = Number.NaN;
            return false;
        }
        else
        {
            var charCode = this._input.charCodeAt(++this._index);

            // "\r\n" -> "\n"
            //
            if ((charCode == 13) && (this._input.charCodeAt(this._index + 1) == 10))
            {
                charCode = 10;
                this._index += 2;
            }

            if (charCode < 128)
            {
                this.current = charCode;
                this.byteCount += 1;
            }
            else if ((charCode > 127) && (charCode < 2048))
            {
                this.current = (charCode >> 6) | 192;
                this._buffer.push((charCode & 63) | 128);
                this.byteCount += 2;
            }
            else
            {
                this.current = (charCode >> 12) | 224;
                this._buffer.push(((charCode >> 6) & 63) | 128);
                this._buffer.push((charCode & 63) | 128);
                this.byteCount += 3;
            }

            return true;
        }
    }
};

function Base64DecodeEnumerator(input)
{
    this._input = input;
    this._index = -1;
    this._buffer = [];
}

Base64DecodeEnumerator.prototype =
{
    current: 64,

    moveNext: function()
    {
        if (this._buffer.length > 0)
        {
            this.current = this._buffer.shift();
            return true;
        }
        else if (this._index >= (this._input.length - 1))
        {
            this.current = 64;
            return false;
        }
        else
        {
            var enc1 = Base64.codex.indexOf(this._input.charAt(++this._index));
            var enc2 = Base64.codex.indexOf(this._input.charAt(++this._index));
            var enc3 = Base64.codex.indexOf(this._input.charAt(++this._index));
            var enc4 = Base64.codex.indexOf(this._input.charAt(++this._index));

            var chr1 = (enc1 << 2) | (enc2 >> 4);
            var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            var chr3 = ((enc3 & 3) << 6) | enc4;

            this.current = chr1;

            if (enc3 != 64)
                this._buffer.push(chr2);

            if (enc4 != 64)
                this._buffer.push(chr3);

            return true;
        }
    }
};

bm.Base64 = Base64;

})(BrassMonkey);
(function(bm){

function getDataURL(img){
  var cvs = document.createElement('canvas'),
      ctx = cvs.getContext('2d');
  cvs.width = img.width;
  cvs.height = img.height;
  ctx.drawImage(img,0,0);
  
  var str = cvs.toDataURL().replace('data:image/png;base64,','');
  return str;
}

bm.loadImages = function(images,cb){
  // Early out if there were zero images in the list
  if(images.length==0){
    cb([]);
    return;
  }
  
  var imagesLoaded = 0,
      imageData = new Array(images.length);
      
  for(var i = 0;i<images.length;i++){
    (function(){
      var j = i,
          img = new Image();
      img.onload=function(){
        imageData[j] = getDataURL(img);
        imagesLoaded++;
        if(imagesLoaded==images.length){
          cb(imageData);
        }
      }
      img.src = images[j];
    })();
  }
}

function generateXMLFromdesign(design,imageData){
  
  var width,height;
  
  if(bm.options.design.orientation=="portrait"){
    width = 320;
    height = 480;
  } else{
    width = 480;
    height = 320;
  }
  
  var xml = '<?xml version="1.0" encoding="utf-8"?>\n'+
            '<BMApplicationScheme version="0.1" orientation="'+design.orientation+
            '" touchEnabled="'+(design.touchEnabled?'yes':'no')+
            '" accelerometerEnabled="'+(design.accelerometerEnabled?'yes':'no')+'">\n';
  
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
  if(design.layout.length!=0){   
    xml+= '<Layout>\n';
    for(var i = 0;i<design.layout.length;i++){
      
      // NOTE: I ensure all DisplayObjects have handler attributes, but
      // this may not be necessary. Talk to Shaules/Zach to find out.
      // For now I do this so that users of the JS SDK don't need to provide something
      var handler = design.layout[i].handler;
      if(design.layout[i].type=="image"){
        handler = "nullHandler";
      }
    
      xml+='<DisplayObject type="'+design.layout[i].type+'" top="'+design.layout[i].y/height+'" left="'+design.layout[i].x/width+'" width="'+design.layout[i].width/width+'" height="'+design.layout[i].height/height+'" functionHandler="'+handler+'">\n';
      if(design.layout[i].type=="image"){
        xml+='<Asset name="up" resourceRef="'+(design.layout[i].image+1)+'" />\n';
      } else {
        xml+='<Asset name="up" resourceRef="'+(design.layout[i].imageUp+1)+'" />\n';
        xml+='<Asset name="down" resourceRef="'+(design.layout[i].imageDown+1)+'" />\n';
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

bm.generateControllerXML = function(imageData){
  var xml = generateXMLFromdesign(bm.options.design,imageData);
  return xml;
}

})(BrassMonkey);
(function(bm){
/**
Each connected device is represented by an instance of this class. 

Communicating with a particular device is done through this class' methods.

@class bm.Device 
@extends bm.EventEmitter
**/

bm.Device = bm.EventEmitter.extend({
  init:function(){
    this._super();
    
    /**
    Display name of the user associated with this device.
    
    If the user is logged in on their device this will be their profile name, otherwise it will be the name they gave their device. 
    
    @property name 
    @type String
    **/
    this.name = "Name";
    
    /**
    The unique identifier of this device.
    
    @property id 
    @type String
    **/
    this.id = "fad2fd2fda2f2f";
    
    // Internal State
    this.touchEnabled = false;
    this.touchInterval = 1/10.0;
    
    this.accelerometerEnabled = false;
    this.accelerometerInterval = 1/10.0;
    
    this.gyroEnabled = false;
    this.gyroInterval = 1/10.0;
    
    this.orientationEnabled = false;
    this.orientationInterval = 1/10.0;
    this.capabilities = 0;
    
    this.mode = "gamepad";
  },
  /**
  Enable/Disable touch events.
  
  Touch events are off by default to reduce network traffic and should only be enabled if you are doing touch based controls. 
  
  @method enableTouch
  @param {Bool} enable If 'true' touches are enabled, if 'false' touches are disabled.
  
  **/
  
  /**
  Set the interval at which touch events are sent from the controller app.
  
  
  @method setTouchInterval
  @param {Float} interval The interval in seconds at which touch events will be sent. 
  
  **/
  
  /**
  Enable/Disable accelerometer events.
  
  Accelerometer events are off by default to reduce network traffic and should only be enabled if you are doing accelerometer based controls. 
  
  @method enableAccelerometer
  @param {Bool} enable If 'true' accelerometer events are enabled, if 'false' accelerometer events are disabled.
  
  **/
  
  /**
  Set the interval at which acclerometer events are sent from the controller app.
  
  
  @method setAccelerometerInterval
  @param {Float} interval The interval in seconds at which accelerometer events will be sent. 
  
  **/
  
  /**
  Enable/Disable gyroscope events.
  
  Gyroscope events are off by default to reduce network traffic and should only be enabled if you are doing gyroscope based controls. 
  
  @method enableGyroscope
  @param {Bool} enable If 'true' gyroscope events are enabled, if 'false' gyroscope events are disabled.
  
  **/
  
  /**
  Set the interval at which gyroscope events are sent from the controller app.
  
  
  @method setGyroscopeInterval
  @param {Float} interval The interval in seconds at which gyroscope events will be sent. 
  
  **/
  
  /**
  Enable/Disable orientation events.
  
  Touch events are off by default to reduce network traffic and should only be enabled if you are doing touch based controls. 
  
  @method enableOrientation
  @param {Bool} enable If 'true' orientation events are enabled, if 'false' orientation events are disabled.
  
  **/
  
  /**
  Set the interval at which touch events are sent from the controller app.
  
  
  @method setOrientationInterval
  @param {Float} interval The interval in seconds at which orientation events will be sent. 
  
  **/
  
  
  /**
  Set which controller mode the device is in.
  
  @method setMode
  @param {String} mode Which mode do you want to set?
  
    **"gamepad"** Show your custom controller layout.
    
    **"keyboard"** Show the built in keyboard input layout.
    
    **"navigation"** Show the built in navigation input layout.
  
    **"wait"** Show the waiting/loading screen. 
  
  **/
  
  /**
  Get which controller mode the device is in.
  
  @method getMode
  @return {String} **"gamepad"**, **"keyboard"**, **"navigation"**, or **"wait"**.
  
  **/
  getMode: function(mode){
    return this.mode;
  },

  /**
  Checks whether the device supports the following capability
  
  @method hasCapabilityaa
  @param {String} the capability to check
    
    **"gyroscope"** Can generate gyroscope events
    
    **"orientation"** Can generate orientation events
  
  @return true if the device has the given capability, false
   if the device does not have the given capability, or the
   capabilities have not been set
  
  **/
  hasCapability : function(feature) {
    if(!(feature in capabilityFlags)) {
      throw new Error("unknown capability " + feature);
    }

    return (this.capabilities & capabilityFlags[feature]) !== 0;
  }
  
});

var capabilityFlags = {
  gyroscope : 1 << 0,
  orientation : 1 << 1
};

/**
Event called on keyboard input.

@event keyboard
@param {String} type keyboard
@param {bm.Device} device Device that generated this event.
@param text {String} Text entered on keyboard. "" if backspace pressed.
@bubbles bm
**/

})(BrassMonkey);
(function(bm){

var deviceIphone = "iphone",
    deviceIpod = "ipod",
    deviceIpad = "ipad",
    // Initialize our user agent string to lower case.
    uagent = navigator.userAgent.toLowerCase();
 
// Detects if the current device is an iPhone.
bm.detectIphone = function() {
	return (uagent.search(deviceIphone) > -1)
}
 
// Detects if the current device is an iPad.
bm.detectIpad = function() {
	return (uagent.search(deviceIpad) > -1)
}
 
// Detects if the current device is an iPod Touch.
bm.detectIpod = function () {
	return (uagent.search(deviceIpod) > -1)
}
 
// Detects if the current device is an iOS device
bm.detectIOS = function() {
	if (bm.detectIphone())
		return true;
	else if (bm.detectIpod())
		return true;
	else if (bm.detectIpad())
		return true;
	else
		return false;
}

bm.detectAndroid = function(){
  // Is it android?
  var ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("android") > -1; 
}

// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
bm.detectInternetExplorerVersion = function(){
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

bm.detectRuntime = function(){
  return "websockets";
  
  if(bm.detectIOS()){
    return "websockets";
  } else {
    return "flash";
  }
}

})(BrassMonkey);
/*! SWFObject v2.2 <http://code.google.com/p/swfobject/> 
  is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
(function(bm){

bm.defineSWFObject = function(){
  
  swfobject = function() {
    
    var UNDEF = "undefined",
      OBJECT = "object",
      SHOCKWAVE_FLASH = "Shockwave Flash",
      SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
      FLASH_MIME_TYPE = "application/x-shockwave-flash",
      EXPRESS_INSTALL_ID = "SWFObjectExprInst",
      ON_READY_STATE_CHANGE = "onreadystatechange",
      
      win = window,
      doc = document,
      nav = navigator,
      
      plugin = false,
      domLoadFnArr = [main],
      regObjArr = [],
      objIdArr = [],
      listenersArr = [],
      storedAltContent,
      storedAltContentId,
      storedCallbackFn,
      storedCallbackObj,
      isDomLoaded = false,
      isExpressInstallActive = false,
      dynamicStylesheet,
      dynamicStylesheetMedia,
      autoHideShow = true,
    
    /* Centralized function for browser feature detection
      - User agent string detection is only used when no good alternative is possible
      - Is executed directly for optimal performance
    */  
    ua = function() {
      var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
        u = nav.userAgent.toLowerCase(),
        p = nav.platform.toLowerCase(),
        windows = p ? /win/.test(p) : /win/.test(u),
        mac = p ? /mac/.test(p) : /mac/.test(u),
        webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
        ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
        playerVersion = [0,0,0],
        d = null;
      if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
        d = nav.plugins[SHOCKWAVE_FLASH].description;
        if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
          plugin = true;
          ie = false; // cascaded feature detection for Internet Explorer
          d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
          playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
          playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
          playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
        }
      }
      else if (typeof win.ActiveXObject != UNDEF) {
        try {
          var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
          if (a) { // a will return null when ActiveX is disabled
            d = a.GetVariable("$version");
            if (d) {
              ie = true; // cascaded feature detection for Internet Explorer
              d = d.split(" ")[1].split(",");
              playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
            }
          }
        }
        catch(e) {}
      }
      return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
    }(),
    
    /* Cross-browser onDomLoad
      - Will fire an event as soon as the DOM of a web page is loaded
      - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
      - Regular onload serves as fallback
    */ 
    onDomLoad = function() {
      if (!ua.w3) { return; }
      if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
        callDomLoadFunctions();
      }
      if (!isDomLoaded) {
        if (typeof doc.addEventListener != UNDEF) {
          doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
        }   
        if (ua.ie && ua.win) {
          doc.attachEvent(ON_READY_STATE_CHANGE, function() {
            if (doc.readyState == "complete") {
              doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
              callDomLoadFunctions();
            }
          });
          if (win == top) { // if not inside an iframe
            (function(){
              if (isDomLoaded) { return; }
              try {
                doc.documentElement.doScroll("left");
              }
              catch(e) {
                setTimeout(arguments.callee, 0);
                return;
              }
              callDomLoadFunctions();
            })();
          }
        }
        if (ua.wk) {
          (function(){
            if (isDomLoaded) { return; }
            if (!/loaded|complete/.test(doc.readyState)) {
              setTimeout(arguments.callee, 0);
              return;
            }
            callDomLoadFunctions();
          })();
        }
        addLoadEvent(callDomLoadFunctions);
      }
    }();
    
    function callDomLoadFunctions() {
      if (isDomLoaded) { return; }
      try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
        var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
        t.parentNode.removeChild(t);
      }
      catch (e) { return; }
      isDomLoaded = true;
      var dl = domLoadFnArr.length;
      for (var i = 0; i < dl; i++) {
        domLoadFnArr[i]();
      }
    }
    
    function addDomLoadEvent(fn) {
      if (isDomLoaded) {
        fn();
      }
      else { 
        domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
      }
    }
    
    /* Cross-browser onload
      - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
      - Will fire an event as soon as a web page including all of its assets are loaded 
     */
    function addLoadEvent(fn) {
      if (typeof win.addEventListener != UNDEF) {
        win.addEventListener("load", fn, false);
      }
      else if (typeof doc.addEventListener != UNDEF) {
        doc.addEventListener("load", fn, false);
      }
      else if (typeof win.attachEvent != UNDEF) {
        addListener(win, "onload", fn);
      }
      else if (typeof win.onload == "function") {
        var fnOld = win.onload;
        win.onload = function() {
          fnOld();
          fn();
        };
      }
      else {
        win.onload = fn;
      }
    }
    
    /* Main function
      - Will preferably execute onDomLoad, otherwise onload (as a fallback)
    */
    function main() { 
      if (plugin) {
        testPlayerVersion();
      }
      else {
        matchVersions();
      }
    }
    
    /* Detect the Flash Player version for non-Internet Explorer browsers
      - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
        a. Both release and build numbers can be detected
        b. Avoid wrong descriptions by corrupt installers provided by Adobe
        c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
      - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
    */
    function testPlayerVersion() {
      var b = document.body;
      var o = createElement(OBJECT);
      var t = b.appendChild(o);
      o.setAttribute("type", FLASH_MIME_TYPE);
      if (t) {
        var counter = 0;
        (function(){
          if (typeof t.GetVariable != UNDEF) {
            var d = t.GetVariable("$version");
            if (d) {
              d = d.split(" ")[1].split(",");
              ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
            }
          }
          else if (counter < 10) {
            counter++;
            setTimeout(arguments.callee, 10);
            return;
          }
          b.removeChild(o);
          t = null;
          matchVersions();
        })();
      }
      else {
        matchVersions();
      }
    }
    
    /* Perform Flash Player and SWF version matching; static publishing only
    */
    function matchVersions() {
      var rl = regObjArr.length;
      if (rl > 0) {
        for (var i = 0; i < rl; i++) { // for each registered object element
          var id = regObjArr[i].id;
          var cb = regObjArr[i].callbackFn;
          var cbObj = {success:false, id:id};
          if (ua.pv[0] > 0) {
            var obj = getElementById(id);
            if (obj) {
              if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                setVisibility(id, true);
                if (cb) {
                  cbObj.success = true;
                  cbObj.ref = getObjectById(id);
                  cb(cbObj);
                }
              }
              else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                var att = {};
                att.data = regObjArr[i].expressInstall;
                att.width = obj.getAttribute("width") || "0";
                att.height = obj.getAttribute("height") || "0";
                if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                // parse HTML object param element's name-value pairs
                var par = {};
                var p = obj.getElementsByTagName("param");
                var pl = p.length;
                for (var j = 0; j < pl; j++) {
                  if (p[j].getAttribute("name").toLowerCase() != "movie") {
                    par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                  }
                }
                showExpressInstall(att, par, id, cb);
              }
              else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
                displayAltContent(obj);
                if (cb) { cb(cbObj); }
              }
            }
          }
          else {  // if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
            setVisibility(id, true);
            if (cb) {
              var o = getObjectById(id); // test whether there is an HTML object element or not
              if (o && typeof o.SetVariable != UNDEF) { 
                cbObj.success = true;
                cbObj.ref = o;
              }
              cb(cbObj);
            }
          }
        }
      }
    }
    
    function getObjectById(objectIdStr) {
      var r = null;
      var o = getElementById(objectIdStr);
      if (o && o.nodeName == "OBJECT") {
        if (typeof o.SetVariable != UNDEF) {
          r = o;
        }
        else {
          var n = o.getElementsByTagName(OBJECT)[0];
          if (n) {
            r = n;
          }
        }
      }
      return r;
    }
    
    /* Requirements for Adobe Express Install
      - only one instance can be active at a time
      - fp 6.0.65 or higher
      - Win/Mac OS only
      - no Webkit engines older than version 312
    */
    function canExpressInstall() {
      return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
    }
    
    /* Show the Adobe Express Install dialog
      - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
    */
    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
      isExpressInstallActive = true;
      storedCallbackFn = callbackFn || null;
      storedCallbackObj = {success:false, id:replaceElemIdStr};
      var obj = getElementById(replaceElemIdStr);
      if (obj) {
        if (obj.nodeName == "OBJECT") { // static publishing
          storedAltContent = abstractAltContent(obj);
          storedAltContentId = null;
        }
        else { // dynamic publishing
          storedAltContent = obj;
          storedAltContentId = replaceElemIdStr;
        }
        att.id = EXPRESS_INSTALL_ID;
        if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
        if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
        doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
        var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
          fv = "MMredirectURL=" + encodeURI(window.location).toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
        if (typeof par.flashvars != UNDEF) {
          par.flashvars += "&" + fv;
        }
        else {
          par.flashvars = fv;
        }
        // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
        // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
        if (ua.ie && ua.win && obj.readyState != 4) {
          var newObj = createElement("div");
          replaceElemIdStr += "SWFObjectNew";
          newObj.setAttribute("id", replaceElemIdStr);
          obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
          obj.style.display = "none";
          (function(){
            if (obj.readyState == 4) {
              obj.parentNode.removeChild(obj);
            }
            else {
              setTimeout(arguments.callee, 10);
            }
          })();
        }
        createSWF(att, par, replaceElemIdStr);
      }
    }
    
    /* Functions to abstract and display alternative content
    */
    function displayAltContent(obj) {
      if (ua.ie && ua.win && obj.readyState != 4) {
        // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
        // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
        var el = createElement("div");
        obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
        el.parentNode.replaceChild(abstractAltContent(obj), el);
        obj.style.display = "none";
        (function(){
          if (obj.readyState == 4) {
            obj.parentNode.removeChild(obj);
          }
          else {
            setTimeout(arguments.callee, 10);
          }
        })();
      }
      else {
        obj.parentNode.replaceChild(abstractAltContent(obj), obj);
      }
    } 
  
    function abstractAltContent(obj) {
      var ac = createElement("div");
      if (ua.win && ua.ie) {
        ac.innerHTML = obj.innerHTML;
      }
      else {
        var nestedObj = obj.getElementsByTagName(OBJECT)[0];
        if (nestedObj) {
          var c = nestedObj.childNodes;
          if (c) {
            var cl = c.length;
            for (var i = 0; i < cl; i++) {
              if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
                ac.appendChild(c[i].cloneNode(true));
              }
            }
          }
        }
      }
      return ac;
    }
    
    /* Cross-browser dynamic SWF creation
    */
    function createSWF(attObj, parObj, id) {
      var r, el = getElementById(id);
      if (ua.wk && ua.wk < 312) { return r; }
      if (el) {
        if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
          attObj.id = id;
        }
        if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
          var att = "";
          for (var i in attObj) {
            if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
              if (i.toLowerCase() == "data") {
                parObj.movie = attObj[i];
              }
              else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                att += ' class="' + attObj[i] + '"';
              }
              else if (i.toLowerCase() != "classid") {
                att += ' ' + i + '="' + attObj[i] + '"';
              }
            }
          }
          var par = "";
          for (var j in parObj) {
            if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
              par += '<param name="' + j + '" value="' + parObj[j] + '" />';
            }
          }
          el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
          objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
          r = getElementById(attObj.id);  
        }
        else { // well-behaving browsers
          var o = createElement(OBJECT);
          o.setAttribute("type", FLASH_MIME_TYPE);
          for (var m in attObj) {
            if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
              if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                o.setAttribute("class", attObj[m]);
              }
              else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
                o.setAttribute(m, attObj[m]);
              }
            }
          }
          for (var n in parObj) {
            if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
              createObjParam(o, n, parObj[n]);
            }
          }
          el.parentNode.replaceChild(o, el);
          r = o;
        }
      }
      return r;
    }
    
    function createObjParam(el, pName, pValue) {
      var p = createElement("param");
      p.setAttribute("name", pName);  
      p.setAttribute("value", pValue);
      el.appendChild(p);
    }
    
    /* Cross-browser SWF removal
      - Especially needed to safely and completely remove a SWF in Internet Explorer
    */
    function removeSWF(id) {
      var obj = getElementById(id);
      if (obj && obj.nodeName == "OBJECT") {
        if (ua.ie && ua.win) {
          obj.style.display = "none";
          (function(){
            if (obj.readyState == 4) {
              removeObjectInIE(id);
            }
            else {
              setTimeout(arguments.callee, 10);
            }
          })();
        }
        else {
          obj.parentNode.removeChild(obj);
        }
      }
    }
    
    function removeObjectInIE(id) {
      var obj = getElementById(id);
      if (obj) {
        for (var i in obj) {
          if (typeof obj[i] == "function") {
            obj[i] = null;
          }
        }
        obj.parentNode.removeChild(obj);
      }
    }
    
    /* Functions to optimize JavaScript compression
    */
    function getElementById(id) {
      var el = null;
      try {
        el = doc.getElementById(id);
      }
      catch (e) {}
      return el;
    }
    
    function createElement(el) {
      return doc.createElement(el);
    }
    
    /* Updated attachEvent function for Internet Explorer
      - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
    */  
    function addListener(target, eventType, fn) {
      target.attachEvent(eventType, fn);
      listenersArr[listenersArr.length] = [target, eventType, fn];
    }
    
    /* Flash Player and SWF content version matching
    */
    function hasPlayerVersion(rv) {
      var pv = ua.pv, v = rv.split(".");
      v[0] = parseInt(v[0], 10);
      v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
      v[2] = parseInt(v[2], 10) || 0;
      return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    }
    
    /* Cross-browser dynamic CSS creation
      - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
    */  
    function createCSS(sel, decl, media, newStyle) {
      if (ua.ie && ua.mac) { return; }
      var h = doc.getElementsByTagName("head")[0];
      if (!h) { return; } // to also support badly authored HTML pages that lack a head element
      var m = (media && typeof media == "string") ? media : "screen";
      if (newStyle) {
        dynamicStylesheet = null;
        dynamicStylesheetMedia = null;
      }
      if (!dynamicStylesheet || dynamicStylesheetMedia != m) { 
        // create dynamic stylesheet + get a global reference to it
        var s = createElement("style");
        s.setAttribute("type", "text/css");
        s.setAttribute("media", m);
        dynamicStylesheet = h.appendChild(s);
        if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
          dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
        }
        dynamicStylesheetMedia = m;
      }
      // add style rule
      if (ua.ie && ua.win) {
        if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
          dynamicStylesheet.addRule(sel, decl);
        }
      }
      else {
        if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
          dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
        }
      }
    }
    
    function setVisibility(id, isVisible) {
      if (!autoHideShow) { return; }
      var v = isVisible ? "visible" : "hidden";
      if (isDomLoaded && getElementById(id)) {
        getElementById(id).style.visibility = v;
      }
      else {
        createCSS("#" + id, "visibility:" + v);
      }
    }
  
    /* Filter to avoid XSS attacks
    */
    function urlEncodeIfNecessary(s) {
      var regex = /[\\\"<>\.;]/;
      var hasBadChars = regex.exec(s) != null;
      return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
    }
    
    /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
    */
    var cleanup = function() {
      if (ua.ie && ua.win) {
        window.attachEvent("onunload", function() {
          // remove listeners to avoid memory leaks
          var ll = listenersArr.length;
          for (var i = 0; i < ll; i++) {
            listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
          }
          // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
          var il = objIdArr.length;
          for (var j = 0; j < il; j++) {
            removeSWF(objIdArr[j]);
          }
          // cleanup library's main closures to avoid memory leaks
          for (var k in ua) {
            ua[k] = null;
          }
          ua = null;
          for (var l in swfobject) {
            swfobject[l] = null;
          }
          swfobject = null;
        });
      }
    }();
    
    return {
      /* Public API
        - Reference: http://code.google.com/p/swfobject/wiki/documentation
      */ 
      registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
        if (ua.w3 && objectIdStr && swfVersionStr) {
          var regObj = {};
          regObj.id = objectIdStr;
          regObj.swfVersion = swfVersionStr;
          regObj.expressInstall = xiSwfUrlStr;
          regObj.callbackFn = callbackFn;
          regObjArr[regObjArr.length] = regObj;
          setVisibility(objectIdStr, false);
        }
        else if (callbackFn) {
          callbackFn({success:false, id:objectIdStr});
        }
      },
      
      getObjectById: function(objectIdStr) {
        if (ua.w3) {
          return getObjectById(objectIdStr);
        }
      },
      
      embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
        var callbackObj = {success:false, id:replaceElemIdStr};
        if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
          setVisibility(replaceElemIdStr, false);
          addDomLoadEvent(function() {
            widthStr += ""; // auto-convert to string
            heightStr += "";
            var att = {};
            if (attObj && typeof attObj === OBJECT) {
              for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                att[i] = attObj[i];
              }
            }
            att.data = swfUrlStr;
            att.width = widthStr;
            att.height = heightStr;
            var par = {}; 
            if (parObj && typeof parObj === OBJECT) {
              for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                par[j] = parObj[j];
              }
            }
            if (flashvarsObj && typeof flashvarsObj === OBJECT) {
              for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                if (typeof par.flashvars != UNDEF) {
                  par.flashvars += "&" + k + "=" + flashvarsObj[k];
                }
                else {
                  par.flashvars = k + "=" + flashvarsObj[k];
                }
              }
            }
            if (hasPlayerVersion(swfVersionStr)) { // create SWF
              var obj = createSWF(att, par, replaceElemIdStr);
              if (att.id == replaceElemIdStr) {
                setVisibility(replaceElemIdStr, true);
              }
              callbackObj.success = true;
              callbackObj.ref = obj;
            }
            else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
              att.data = xiSwfUrlStr;
              showExpressInstall(att, par, replaceElemIdStr, callbackFn);
              return;
            }
            else { // show alternative content
              setVisibility(replaceElemIdStr, true);
            }
            if (callbackFn) { callbackFn(callbackObj); }
          });
        }
        else if (callbackFn) { callbackFn(callbackObj); }
      },
      
      switchOffAutoHideShow: function() {
        autoHideShow = false;
      },
      
      ua: ua,
      
      getFlashPlayerVersion: function() {
        return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
      },
      
      hasFlashPlayerVersion: hasPlayerVersion,
      
      createSWF: function(attObj, parObj, replaceElemIdStr) {
        if (ua.w3) {
          return createSWF(attObj, parObj, replaceElemIdStr);
        }
        else {
          return undefined;
        }
      },
      
      showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
        if (ua.w3 && canExpressInstall()) {
          showExpressInstall(att, par, replaceElemIdStr, callbackFn);
        }
      },
      
      removeSWF: function(objElemIdStr) {
        if (ua.w3) {
          removeSWF(objElemIdStr);
        }
      },
      
      createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
        if (ua.w3) {
          createCSS(selStr, declStr, mediaStr, newStyleBoolean);
        }
      },
      
      addDomLoadEvent: addDomLoadEvent,
      
      addLoadEvent: addLoadEvent,
      
      getQueryParamValue: function(param) {
        var q = doc.location.search || doc.location.hash;
        if (q) {
          if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
          if (param == null) {
            return urlEncodeIfNecessary(q);
          }
          var pairs = q.split("&");
          for (var i = 0; i < pairs.length; i++) {
            if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
              return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
            }
          }
        }
        return "";
      },
      
      // For internal usage only
      expressInstallCallback: function() {
        if (isExpressInstallActive) {
          var obj = getElementById(EXPRESS_INSTALL_ID);
          if (obj && storedAltContent) {
            obj.parentNode.replaceChild(storedAltContent, obj);
            if (storedAltContentId) {
              setVisibility(storedAltContentId, true);
              if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
            }
            if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
          }
          isExpressInstallActive = false;
        } 
      }
    };
  }();
}

// Provide swfobject implementation if one wasn't provided
if(window["swfobject"]===undefined){
  // TODO: Optimize this to not even be loaded unless we need it.
  bm.defineSWFObject();
}

})(BrassMonkey);
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
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, sub:true, maxerr:50 */
/*global WebSocket:false, BrassMonkey:true, unescape:false, escape:false */
(function(bm) {
"use strict";

// Enums
var PACKET_DATA = 0;
var PACKET_PING = 1;
var PACKET_ACK = 2;
var PACKET_ECHO = 3;
var PACKET_ANALYSIS = 4;
var PACKET_KEEP_ALIVE = 5;

var CHANNEL_BROADCAST = 0;
var CHANNEL_ACCELERATION = 1;
var CHANNEL_TOUCH = 2;
var CHANNEL_MESSAGE = 3;
var CHANNEL_SHAKE = 4;
var CHANNEL_BYTE = 5;
var CHANNEL_GYRO = 6;
var CHANNEL_ORIENTATION = 7;

var DEVICE_ANY = 0;
var DEVICE_UNITY = 1;
var DEVICE_IPHONE = 2;
var DEVICE_FLASH = 3;
var DEVICE_ANDROID = 4;
var DEVICE_NATIVE = 5;

var ENCODE_PACKET = 0;
var ENCODE_ADDRESS = 1;
var ENCODE_PARAMETER = 3;
var ENCODE_INVOKE = 4;
var ENCODE_ACCELERATION = 5;
var ENCODE_TOUCH_SET = 6;
var ENCODE_DEVICE_IPHONE = 7;
var ENCODE_DEVICE_UNITY = 8;
var ENCODE_DEVICE_ANDROID = 10;
var ENCODE_DEVICE_NATIVE = 15;
var ENCODE_DEVICE_PALM = 16;
var ENCODE_DEVICE_SERVER = 17;
var ENCODE_DEVICE_FLASH = 18;
var ENCODE_ACK = 9;
var ENCODE_PING = 11;
var ENCODE_SHAKE = 13;
var ENCODE_BYTE_CHUNK = 14;
var ENCODE_REGISTRY_INFO = 19;
var ENCODE_TAGGED_ARRAY = 21;
var ENCODE_GYRO = 22;
var ENCODE_ORIENTATION = 23;

var controlModes = {
  gamepad : 0,
  keyboard : 1,
  navigation : 2,
  wait : 3
};


var connections = [];

var packedVersion = packVersion({major:1, minor:4});

var localDevice = {
  id : "sadkldsjadsjladsjklsaklasdkljsadla",
  name : "dorian",
  type : DEVICE_FLASH,
  encodeType : ENCODE_DEVICE_FLASH
};

var localAddress = {
  hostname : "unknown",
  updPort : 0,
  tcpPort : 0,
  encodeType : ENCODE_ADDRESS
};

var removeConnection = function(connection) {
  var index = connections.indexOf(connections);
  if(index >= 0)  {
    connections.splice(index, 1);
    bm.removeDevice(connection);
  }
};

var bind = function(func, target) {
  return function() {
    func.apply(target, arguments);
  };
};

var makeInvoke = function(methodName, params) {
  return {
    method : methodName,
    returnMethod : "",
    params : params,
    encodeType : ENCODE_INVOKE
  };
};

var start = function(ipAddress) {
  bm.log("start");
  
  connections.push(new Connection("deviceId", ipAddress, 9011));
};

var stop = function() {
  var i;
  for(i = 0; i < connections.length; ++i) {
    bm.removeDevice(connections[i]); // < Should this be done?
    connections[i].close();
  }
  connections.length = 0;
  bm.log("stop");
};

var Connection = bm.Device.extend({
  init : function(deviceId, host, port) {
    var socket;
    this._super();
    this.id = deviceId;
    socket = this.socket = new WebSocket("ws://" + host + ":" + port);
    this.sequence = 0;
    this.capabilities = 0;

    this.touchEnabled = bm.options.design.touchEnabled;
    this.accelerometerEnabled = bm.options.design.accelerometerEnabled;

    var self = this;
    socket.onerror = bind(this.onError, this);
    socket.onclose = bind(this.onClose, this);
    socket.onmessage = bind(this.onVersion, this);
    socket.onopen = bind(this.onOpen, this);
  },

  onError : function() {
    removeConnection(this);
    bm.log("error");
  },

  onClose : function(/*closeEvent*/) {
    removeConnection(this);
    bm.log("DISCONNECTED");
  },

  onOpen : function() {
    var handshake = [packedVersion, packedVersion];
    this.socket.send(JSON.stringify(handshake));
    bm.log("CONNECTED");
  },

  onVersion : function(message) {
    var json = JSON.parse(message.data);
    bm.log("GOT VERSION");

    // TODO: verify version
    this.sendPacket({
      type : PACKET_ACK,
      message : {
        encodeType: ENCODE_ACK,
        device: localDevice,
        address: localAddress
      }
    });

    this.sendInvoke("setReliabilityForTouch", [['i', 2], ['i', 2]]);

    this.socket.onmessage = bind(this.onMessage, this);
  },

  setMode : function(mode, text) {
    if(this.mode !== mode) {
      if(!(mode in controlModes)) {
        throw new Error("unknown control mode " + mode);
      }

      this.mode = mode;
      var modeIndex = controlModes[mode];
      if(text !== undefined) {
        this.sendInvoke("SetControlMode", [['i',modeIndex], ['*',text]]);
      } else {
        this.sendInvoke("SetControlMode", [['i',modeIndex]]);
      }
    }
  },

  enableGyroscope : function (enabled) {
    if(enabled !== this.gyroEnabled) {
      this.gyroEnabled = enabled;
      this.sendInvoke("enableGyro", [['B', enabled]]);
    }
  },

  setGyroscopeInterval : function(interval) {
    if(interval !== this.gyroInterval) {
      this.gyroInterval = interval;
      this.sendInvoke("setGyroInterval", [['f',interval]]);
    }
  }

});

var cp = Connection.prototype;

var generateSensorMethods = function(name) {
  var capsName = name.charAt(0).toUpperCase() + name.slice(1),
      enabledField = name + "Enabled",
      intervalField = name + "Interval",
      enableMethod = "enable" + capsName,
      intervalMethod = "set" + capsName + "Interval";
  cp[enableMethod] = function (enabled) {
    if(enabled !== this[enabledField]) {
      this[enabledField] = enabled;
      this.sendInvoke(enableMethod, [['B', enabled]]);
    }
  };

  cp[intervalMethod] = function(interval) {
    if(interval !== this[intervalField]) {
      this[intervalField] = interval;
      this.sendInvoke(intervalMethod, [['f',interval]]);
    }
  };
};

generateSensorMethods('touch');
generateSensorMethods('accelerometer');
generateSensorMethods('orientation');

var notify = function(connection, type, event) {
  //TODO: remove debug log
  bm.log("notify: " + type);
  connection.trigger(type, event);
  bm.trigger(type, event);
};

cp.onMessage = function(message) {
  var json = JSON.parse(message.data),
      packet = decodePacket(json),
      channel = packet.channel;

  //bm.log("GOT MESSAGE: " + JSON.stringify(packet));
  if(CHANNEL_MESSAGE === channel) {
    this.handleInvoke(packet.message);
  }
  else if(CHANNEL_SHAKE === channel) {
    notify(this, "shake", {device: this});
  }
  else if(CHANNEL_ACCELERATION === channel) {
    notify(this, "acceleration", {device:this, acceleration:packet.message});
  }
  else if(CHANNEL_TOUCH === channel) {
  
    // Convert events to something more similar to web standards
    // TODO:  Revisit this as looking at the web standards they seem messier than they should be
    //        but the benefits of people being able to drop in brass monkey to replace existing
    //        may out weight that.
    var touches = packet.message.touches,
        len = touches.length;
    console.log(len);
    for(var i = 0; i<len;i++){
      // NOTE:  Touch ids are made from a combination of the device id and the in coming touch id
      //        so that they are unique for clients of the SDK to be able to identify them as unique
      //        if doing logic that combines the touch events coming from multiple devices.
      //        In practice when coding say multi user drawing apps this came up for me (Francois)
      //        allowing me to use the id of a particular touch coming from a particular device and know
      //        it's unique across all touches coming from all devices. The existing ids are only unique to
      //        a particular device.
      switch(touches[i].phase){
        case 1:
          notify(this, "touchstart", {device:this, x:touches[i].x, y:touches[i].y,id:this.id+touches[i].id});
          break;
        case 2:
          notify(this, "touchmove", {device:this, x:touches[i].x, y:touches[i].y,id:this.id+touches[i].id});
          break;
        case 4:
          notify(this, "touchend", {device:this, x:touches[i].x, y:touches[i].y,id:this.id+touches[i].id});
          break;
      }
    }
  }
  else if(CHANNEL_GYRO === channel) {
    notify(this, "gyroscope", {device:this, gyroscope:packet.message});
  }
  else if(CHANNEL_ORIENTATION === channel) {
    notify(this, "orientation", {device:this, orientation:packet.message});
  }
};

cp.close = function() {
  this.socket.close();
};

cp.handleInvoke = function(invoke) {
  switch(invoke.method) {
    case "RequestXML":
      this.sendControlScheme();
      break;

    case "GetPortalId":
      if(bm.options.portalId) {
        this.sendInvoke(invoke.returnMethod, [['*', bm.options.portalId]]);
      }
      break;

    case "setCapabilities":
      this.capabilities = invoke.params[0][1];
      bm.addDevice(this);
      break;

    case "onKeyString":
      notify(this, "keyboard", {device:this, text:invoke.params[0][1]});
      break;

    case "onControlSchemeParsed":
      break;

    case "WaitCancelled":
      // TODO: name?
      notify(this, "waitcancelled", {device:this});
      break;

    case "bmPause":
      // TODO: keep track of pause state?
      notify(this, "pause", {device:this});
      break;

    case "onNavigationString":
      // TODO: ?
      notify(this, "navstring", {device:this, string:invoke.params[0][1]});
      break;

    default:
      this.handleButtonInvoke(invoke);
      break;
  }
};

cp.handleButtonInvoke = function(invoke) {
  var firstParam;
  if(invoke.params.length !== 1) {
    return;
  }

  var value = invoke.params[0][1];

  if(value === "up") {
    notify(this, "buttonup", {device:this, button:invoke.method});
  }
  else if(value === "down") {
    notify(this, "buttondown", {device:this, button:invoke.method});
  }
};

cp.sendControlScheme = function() {
  for(var i = 0; i < controlSchemeChunks.length; ++i) {
    this.sendPacket({
      channel : CHANNEL_BYTE,
      message : controlSchemeChunks[i]
    });
  }
};

cp.sendInvoke = function(method, params) {
  this.sendPacket({channel:CHANNEL_MESSAGE, message:makeInvoke(method, params)});
};

cp.sendPacket = function(packet) {
  packet.sequence = ++this.sequence;
  packet.deviceId = localDevice.id;
  packet.deviceType = localDevice.type;
  packet.channel = packet.channel || CHANNEL_BROADCAST;
  packet.type = packet.type || PACKET_DATA;
  packet.rtt = 0;
  packet.timestamp = 0;
  //bm.log("WROTE PACKET: " + JSON.stringify(packet));
  var encodedPacket = encodePacket(packet);
  this.socket.send(JSON.stringify(encodedPacket));
};





/////////////////////////////////////////////////////////////////////
//   Serialization Stuff
/////////////////////////////////////////////////////////////////////
//   Serialization Stuff
function packVersion(version) {
  return ((version.major&0xFF)<<24) | ((version.minor&0xFF)<<16);
}

function unpackVersion(packed) {
  return {
    major: (packed >> 24)&0xFF,
    minor: (packed >> 16)&0xFF
  };
}

var INCLUDE_UNUSED_ENCODERS = false;



function decodeObject(encoded) {
  var decoder = decoders[encoded[0]];
  if(decoder) {
    return decoder(encoded);
  }

  throw new Error("no decoder for "+encoded);
}

function encodeObject(object) {
  var encoder = encoders[object.encodeType];
  if(encoder) {
    return encoder(object);
  }
  
  throw new Error("no encoder for "+object);
}

var decoders = [];
var encoders = [];

function decodePacket(encoded) {
  var packet = {};
  var i = 0;
  packet.channel = encoded[++i];
  packet.sequence = encoded[++i];
  packet.timestamp = encoded[++i];
  packet.rtt = encoded[++i];
  packet.type = encoded[++i];
  packet.deviceType = encoded[++i];
  packet.deviceId = encoded[++i];
  packet.deviceName = encoded[++i];
  if(encoded[++i]) {
    packet.message = decodeObject(encoded[++i]);
  }
  return packet;
}
decoders[ENCODE_PACKET] = decodePacket;

function encodePacket(packet) {
  return [ENCODE_PACKET, packet.channel, packet.sequence, 0, 0, packet.type, packet.deviceType, packet.deviceId, packet.deviceName, true, encodeObject(packet.message)];
}
encoders[ENCODE_PACKET] = encodePacket;

function decodeAddress(encoded) {
  return { hostname:encoded[1], udpPort:encoded[2], tcpPort:encoded[3] };
}
decoders[ENCODE_ADDRESS] = decodeAddress;

function encodeAddress(address) {
  return [ENCODE_ADDRESS, address.hostname, address.udpPort, address.tcpPort];
}
encoders[ENCODE_ADDRESS] = encodeAddress;

////
// Parameter
// (zfk) I am just going to represent this as an array for compactness
// I can get away with it since only Invokes use them
function decodeParameter(encoded) {
  var type = encoded[1];
  var value = encoded[2];
  if(type === '@') {
    value = decodeObject(value);
  }
  return [type, value];
}
decoders[ENCODE_PARAMETER] = decodeParameter;

function encodeParameter(param) {
  return [ENCODE_PARAMETER, param[0], (param[0] === '@' ? encodeObject(param[1]) : param[1])];
}
encoders[ENCODE_PARAMETER] = encodeParameter;

function decodeInvoke(encoded) {
  var i = 0;
  var params = [];
  var invoke = {};
  ++i; // invoke_id
  invoke.method = encoded[++i];
  invoke.returnMethod = encoded[++i];
  invoke.params = params;

  var paramCount = encoded[++i];
  var paramEnd = i + paramCount;
  while( i < paramEnd ) {
    params.push(decodeParameter(encoded[++i]));
  }

  return invoke;
}
decoders[ENCODE_INVOKE] = decodeInvoke;

function encodeInvoke(invoke) {
  var params = invoke.params;
  var encoded = [ENCODE_INVOKE, 0, invoke.method, invoke.returnMethod, params.length];
  var i;
  for(i = 0; i < params.length; ++i) {
    encoded.push(encodeParameter(params[i]));
  }
  return encoded;
}
encoders[ENCODE_INVOKE] = encodeInvoke;


function decodeAcceleration(encoded) {
  return {'x':encoded[1], 'y':encoded[2], 'z':encoded[3]};
}
decoders[ENCODE_ACCELERATION] = decodeAcceleration;

if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_ACCELERATION] = function(accel) {
    return [ENCODE_ACCELERATION, accel['x'], accel['y'], accel['z'] ];
  };
}

////////////
// Touch Set
////////////
decoders[ENCODE_TOUCH_SET] = function(encoded) {
  var i = 0;
  var touchCount = encoded[++i];
  var touches = [];
  var currentTouch;
  for(currentTouch = 0; currentTouch < touchCount; ++currentTouch) {
    var touch = {};
    touch['x'] = encoded[++i];
    touch['y'] = encoded[++i];
    touch['viewWidth'] = encoded[++i];
    touch['viewHeight'] = encoded[++i];
    touch['phase'] = encoded[++i];
    touch['id'] = encoded[++i];
    touches.push(touch);
  }

  return {touches:touches};
};

if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_TOUCH_SET] = function(touchSet) {
    var touches = touchSet.touches;
    var encoded = [ENCODE_TOUCH_SET, touches.length];
    var i;
    for(i = 0; i < touches.length; ++i) {
      var touch = touches[i];
      encoded.push(touch['x']);
      encoded.push(touch['y']);
      encoded.push(touch['viewWidth']);
      encoded.push(touch['viewHeight']);
      encoded.push(touch['phase']);
      encoded.push(touch['id']);
    }
    return encoded;
  };
}

//
// Devices
function decodeDevice(encoded) {
  return {encodeType:encoded[0], type:encoded[1], id:encoded[2], name:encoded[3]};
}
function encodeDevice(device) {
  return [device.encodeType, device.type, device.id, device.name];
}

var addDeviceEncoder = function(type) {
  decoders[type] = decodeDevice;
  encoders[type] = encodeDevice;
};

addDeviceEncoder(ENCODE_DEVICE_IPHONE);
addDeviceEncoder(ENCODE_DEVICE_UNITY);
addDeviceEncoder(ENCODE_DEVICE_ANDROID);
addDeviceEncoder(ENCODE_DEVICE_NATIVE);
addDeviceEncoder(ENCODE_DEVICE_PALM);
addDeviceEncoder(ENCODE_DEVICE_FLASH);

//
// Ack
decoders[ENCODE_ACK] = function(encoded) {
  return { device:decodeDevice(encoded[1]), address:decodeAddress(encoded[2]) };
};
encoders[ENCODE_ACK] = function(ack) {
  return [ENCODE_ACK, encodeDevice(ack.device), encodeAddress(ack.address)];
};

//
// Ping
decoders[ENCODE_PING] = function(encoded) {
  return {uid:encoded[1], address:decodeAddress(encoded[2])};
};
encoders[ENCODE_PING] = function(ping) {
  return [ENCODE_PING, ping.uid, encodeAddress(ping.address)];
};

//
// Shake
decoders[ENCODE_SHAKE] = function(/*encoded*/) {
  return {};
};
encoders[ENCODE_SHAKE] = function(/*shake*/) {
  return [ENCODE_SHAKE, 0];
};

// ByteChunk
decoders[ENCODE_BYTE_CHUNK] = function(encoded) {
  return {
    setId : encoded[1],
    startByte : encoded[2],
    chunkSize : encoded[3],
    totalSize : encoded[4],
    data : encoded[5]
  };
};
encoders[ENCODE_BYTE_CHUNK] = function(chunk) {
  return [ENCODE_BYTE_CHUNK, chunk.setId, chunk.startByte, chunk.chunkSize, chunk.totalSize, chunk.data];
};

// RegistryInfo
decoders[ENCODE_REGISTRY_INFO] = function(encoded) {
  var i = 0;
  var info = {};
  info.device = decodeDevice(encoded[++i]);
  info.address = decodeAddress(encoded[++i]);
  info.appId = encoded[++i];
  info.slotId = encoded[++i];
  if(info.slotId > 0) {
    info.currentPlayers = encoded[++i];
    info.maxPlayers = encoded[++i];
  }
  return info;
};
encoders[ENCODE_REGISTRY_INFO] = function(info) {
  var encoded = [
    ENCODE_REGISTRY_INFO,
    encodeDevice(info.device),
    encodeAddress(info.address),
    info.appId,
    info.slotId
  ];
  if(info.slotId > 0) {
    encoded.push(info.currentPlayers);
    encoded.push(info.maxPlayers);
  }
  return encoded;
};

// TaggedArray
// TODO

// Gyro
decoders[ENCODE_GYRO] = function(encoded) {
  return {'x':encoded[1], 'y':encoded[2], 'z':encoded[3]};
};
if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_GYRO] = function(gyro) {
    return [ENCODE_GYRO, gyro['x'], gyro['y'], gyro['z'] ];
  };
}

// Orientation
decoders[ENCODE_ORIENTATION] = function(encoded) {
  return {'x':encoded[1], 'y':encoded[2], 'z':encoded[3], 'w':encoded[4]};
};
if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_ORIENTATION] = function(q) {
    return [ENCODE_ORIENTATION, q['x'], q['y'], q['z'], q['w'] ];
  };
}

var controlSchemeChunks;
var generateByteChunks = function(xml) {
  var MAX_CHUNK_SIZE = 1024*32,
    chunks = [],
    xmlLength = xml.length,
    nextChar = 0,
    totalBytes = 0;

  for(nextChar = 0; nextChar < xmlLength; nextChar += MAX_CHUNK_SIZE) {
    var result = bm.Base64.encode(xml.substr(nextChar, MAX_CHUNK_SIZE)),
        chunkSize = result[0],
        encoded = result[1];

    chunks.push({
      encodeType : ENCODE_BYTE_CHUNK,
      setId: 'testXML',
      startByte: totalBytes,
      chunkSize: chunkSize,
      data: encoded
    });

    totalBytes += chunkSize;
  }

  for(var i = 0; i < chunks.length; ++i) {
    chunks[i].totalSize = totalBytes;
  }

  return chunks;
};



function createDebugControls(){
  // Create a DOM element to hold the elements of the controller layout
  var ui = document.createElement('div');
  document.body.insertBefore(ui,document.body.firstChild);
  
  ui.style.width = "273px";
  ui.style.height = "23px";
  ui.style.position = "absolute";
  ui.style.overflow = "hidden";
  ui.style.border = "thin solid grey";
  ui.style.backgroundColor = "white";
  
  // Create Start Button
  var startButton = document.createElement('input');
  startButton.setAttribute("type", "button");
  startButton.setAttribute("value", "Start");
  startButton.setAttribute("name", "start");
  
  startButton.onclick = function(){
    // Store IP address
    setCookie("ipaddress",ipAddress.value);
  
    // Load all of the controller images and then generate
    // the base64 encoded version of their data for sending
    // to the controller app devices as they connect.
    // TODO: Can we do work in parallel with this?
    bm.loadImages(bm.options.design.images,function(imageData){
      var xml = bm.generateControllerXML(imageData);
      controlSchemeChunks = generateByteChunks(xml);
      start(ipAddress.value);
    });
  };
  ui.appendChild(startButton);
  
  // Create input field for the device IP Address
  var ipAddress = document.createElement('input');
  
  ipAddress.style.width = "120px";
  ipAddress.setAttribute("type", "text");
  ipAddress.setAttribute("name", "");
  
  // Load the previously entered IP address
  var previousIP = getCookie("ipaddress");
  if(previousIP){
    ipAddress.setAttribute("value", previousIP);
  } else {
    ipAddress.setAttribute("value", "<ipaddress>");
  }
  ui.appendChild(ipAddress);
  
  function setCookie(c_name,value){
    var exdays = 365,
        exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays===null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  }
  
  function getCookie(c_name){
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++){
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x===c_name){
        return unescape(y);
      }
    }
  }
}

//
if(bm.detectRuntime()==="websockets"){
  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', createDebugControls, false);
  } else {
    window.attachEvent('onload', createDebugControls);
  }
}

bm.WebSocketsRT = bm.Class.extend({
  init:function(){
  },
  start: function(options){
    localDevice.id = options.deviceId;
    localDevice.name = options.name;
    bm.log(options.deviceId);
  },
  stop: function(){
    stop();
  }
});

})(BrassMonkey);