(function(){

EventEmitter = function(){
  this.callbacks = {};
}

EventEmitter.prototype.on = function(eventType,cb){
  if (typeof cb !== 'function'){
    throw new Error('.on() only accepts instances of Function');
  }

  // Make an array for this particular eventName
  if(this.callbacks[eventType]===undefined){
    this.callbacks[eventType] = [];
  }

  // TODO: Is there any cheap way to detect duplicates.
  this.callbacks[eventType].push(cb);  
}

// Alias to longer webstandard like name
EventEmitter.prototype.addEventListener = EventEmitter.prototype.on;

EventEmitter.prototype.off = function(eventType,cb){
  // Remove the callback from the list of listeners for the
  // respective eventType
  if(this.callbacks[eventType]!==undefined){
    var i,callbacks = this.callbacks[eventType];
    for(var i = 0; i<callbacks.length;i++){
      if(callbacks[i]==cb){
        callbacks.splice(i,1);
        return;
      }
    }
  }
}

// Alias to longer webstandard like name
EventEmitter.prototype.removeEventListener = EventEmitter.prototype.off;

EventEmitter.prototype.trigger = function(eventType,event){
  if(this.callbacks[eventType]!==undefined){
    var i,callbacks = this.callbacks[eventType];
    for(var i = 0; i<callbacks.length;i++){
      callbacks[i](event);
    }
  }
}


/**
The Brass Monkey SDK. This is a singleton accessed like so:

    bm.init(...);
    
or

    var version = bm.version;

@class BrassMonkey
@static
**/

// Create the BrassMonkey global object. (Give it a short alias of 'bm' also)
// TODO:  Make a function similar to jQuery.noConflict(). I've already had
//        issues with collisions on a global bm. object when working with Game Maker
//        generated game projects.

bm = BrassMonkey = new EventEmitter();

// Add EventEmitter to the bm namespace Event Emitter
bm.EventEmitter = EventEmitter;

bm.on('hi',function(event){
  alert(event.message);
});
bm.trigger('hi',{message:"hi"});


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
bm.version = "0.5.0";

// Constants
bm.MODE_GAMEPAD=0;	
bm.MODE_KEYBOARD=1;		
bm.MODE_NAVIGATION=2;		
bm.MODE_WAIT=3;


})();