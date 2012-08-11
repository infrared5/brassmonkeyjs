(function(bm){

/**
Event called when a mobile device first establishes a connection. 

**Note:** 

@class bm.DeviceAvailableEvent
**/

bm.DeviceAvailableEvent = function(device){
/**
Device Associated with this event.

@property device 
@type {bm.Device}
**/
  this.device = device;
}

/**
Event called when a mobile device successfully established a connection.

@class bm.DeviceConnectedEvent
**/


bm.DeviceConnectedEvent = function(device){
/**
Device Associated with this event.

@property device 
@type {bm.Device}
**/
  this.device = device;
}

/**
Event called when a mobile device is disconnected.

@class bm.DeviceDisconnectedEvent
**/


bm.DeviceDisconnectedEvent = function(device){
/**
Device Associated with this event.

@property device 
@type {bm.Device}
**/
  this.device = device;
}


/**
Event called when the SDK has received it's assigned slot index/color.

This is the unique color that is displayed in top right of the console, in your game, and 
on the device list in the controller app. It's used to help users disambiguate which
console/game they want to connect to, if there is more than one on your network.

@class bm.ShowSlotColorEvent
**/

  // Lookup table for converting slot index numbers into an agreed upon matching color.
var slotColors = [
  "#ff6600","#ffcc00","#ff3399","#ff0066",
  "#cc00ff","#999900","#9999cc","#00cc99",
  "#287200","#00ccff","#003366","#99ff00",
  "#cc0000","#80cd68","#6600ff"
];

bm.ShowSlotColorEvent = function(device){
/**
Device Associated with this event.

@property device 
@type {bm.Device}

**/
  this.device = device;
/**
Unique identifier to your network. (Each instance of Brass Monkey running get it's own slotIndex number)

@property slotIndex 
@type {Number}

**/

  // (Francois) I'm not sure why there is this modulus/arithmetic here.
  this.index = (Math.max(1, this.index) - 1) % slotColors.length;
  
/**
Color to display on the screen. (CSS Style Hexidecimal)

Example:

    "#ff0000"

@property color 
@type {String}

**/
  
  this.color = slotColors[this.index];
}

})(BrassMonkey);