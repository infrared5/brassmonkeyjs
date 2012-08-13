(function(bm){

/**
Event

@class bm.Event
**/
bm.Event = bm.Class.extend({
  init:function(eventType){
    /**
    Which event this instance is representing.
    
    Examples: 
        
        "buttondown", "buttonup", or "shake"
    
    @property type 
    @type {String}
    **/
    this.type = eventType;
  }
});

/**
Event called when a mobile device first establishes a connection. 

**Note:** 

@class bm.DeviceAvailableEvent
**/

bm.DeviceAvailableEvent = bm.Event.extend({
  init: function(device){
    this._super("deviceavailable");
    /**
    Device Associated with this event.
    
    @property device 
    @type {bm.Device}
    **/
    this.device = device;
  }
});

/**
Event called when a mobile device successfully established a connection.

@class bm.DeviceConnectedEvent
**/


bm.DeviceConnectedEvent = bm.Event.extend({
  init: function(device){
    this._super("deviceconnected");
    /**
    Device Associated with this event.
    
    @property device 
    @type {bm.Device}
    **/
    this.device = device;
  }
});

/**
Event called when a mobile device is disconnected.

@class bm.DeviceDisconnectedEvent
**/


bm.DeviceDisconnectedEvent = bm.Event.extend({
  init: function(device){
    this._super("devicedisconnected");
    /**
    Device Associated with this event.
    
    @property device 
    @type {bm.Device}
    **/
    this.device = device;
  }
});

/**
Event for when a button was pressed or released.

@class bm.ButtonEvent
**/

bm.ButtonEvent = bm.Event.extend({
  init: function(eventType,device,button){
    this._super(eventType);
    /**
    Device Associated with this event.
    
    @property device 
    @type {bm.Device}
    **/
    this.device = device;
    
    /**
    The id of the button that was pressed/released
    
    @property button 
    @type {String}
    **/
    this.button = button;
  }
});

/**
Event indicating the user shook their device.

@class bm.ShakeEvent
**/

bm.ShakeEvent = bm.Event.extend({
  init: function(eventType,device){
    this._super("shake");
    /**
    Device Associated with this event.
    
    @property device 
    @type {bm.Device}
    **/
    this.device = device;
  }
});



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

bm.ShowSlotColorEvent = bm.Event.extend({
  init: function(device){
    this._super("showslotcolor");
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
});

})(BrassMonkey);