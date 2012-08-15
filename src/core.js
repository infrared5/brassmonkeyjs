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

  Accelerometer events must be enabled (See [Device.enableAccelerometer](bm.Device.html)) and are sent continuously on the interval specified by [Device.setAccelerometerInterval](bm.Device.html).

@event accelerometer
@param {String} type Which event this is. Ie. **"accelerometer"**
@param {bm.Device} device Device that generated this event.
**/

/**
Event representing the latest gyroscope values.

**Note:** 

  Gyroscope events must be enabled (See [Device.enableGyroscope](bm.Device.html)) and are sent continuously on the interval specified by [Device.setGyroscopeInterval](bm.Device.html).

@event gyroscope
@param {String} type Which event this is. Ie. **"gyroscope"**
@param {bm.Device} device Device that generated this event.
**/

/**
Event representing the latest orientation values.

**Note:** 

  Orientation events must be enabled (See [Device.enableOrientation](bm.Device.html)) and are sent continuously on the interval specified by [Device.setOrientationInterval](bm.Device.html).

@event orientation
@param {String} type Which event this is. Ie. **"orientation"**
@param {bm.Device} device Device that generated this event.
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
Event indicating the user shook their device.

**Note:** Accelerometer/Gyroscope events do not need to enabled, shake events do not take much network traffic so this was unnecessary.

@event shake
@param {String} type Which event this is, Ie. **"shake"**
@param {bm.Device} device Device that generated this event.
**/

})();