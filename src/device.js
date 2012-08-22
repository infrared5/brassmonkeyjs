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

/**
  Tells the device to connect to a host with the given id after it
  shows up in the device list.

  TODO: is this appropriate to document publicly?
  
  @method waitForHost
  @param {String} hostId The device id of the host to connect to.
  
  **/

  
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