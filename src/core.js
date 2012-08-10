(function(){
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
bm = BrassMonkey = {};

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