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
  @param {Function} fn Function to be called back when the event occurs.
  
  **/

  addEventListener: function(eventType,fn){
    if (typeof fn !== 'function'){
      throw new Error('.on() only accepts instances of Function');
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
    this.off(eventType,fn);
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
  }
});

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
    
    
    this.devices = [];
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
      
    @param {URL} [options.swfURL]
      The location of the SWF file that implements 
      the SDK when there a browser doesn't support Websockets. 
      
      If not provided the matching version on the Brass Monkey CDN is used.
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
    
    
    
    // Choose the proper communication runtime based on the environment.
    // For now it's basically WebSockets in Mobile Safari otherwise Flash
    // everywhere else.
    if(true){//bm.detectIOS()){
      this.runtime = new bm.WebSocketsRT();
    } else {
      this.runtime = new bm.FlashRT();
    }
    
    this.runtime.start();
  },
  
  /**
  Shutdown Brass Monkey
  
  @method stop
  **/
  stop: function(){
    if(bm.runtime!==undefined){
      bm.runtime.stop();
    }
  }
});

// Create singleton instance of BrassMonkey
bm = BrassMonkey = new BrassMonkeyClass();

// Add EventEmitter to the BrassMonkey namespace
bm.EventEmitter = EventEmitter;

// Constants
/*
bm.MODE_GAMEPAD=0;	
bm.MODE_KEYBOARD=1;		
bm.MODE_NAVIGATION=2;		
bm.MODE_WAIT=3;
*/

})();