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
    this.touchInterval = 1/10;
    
    this.accelerometerEnabled = false;
    this.accelerometerInterval = 1/10;
    
    this.mode = "gamepad";
  },
  /**
  Enable/Disable touch events.
  
  Touch events are off by default to reduce network traffic and should only be enabled if you are doing touch based controls. 
  
  @method enableTouch
  @param {Bool} enable If 'true' touches are enabled, if 'false' touches are disabled.
  @param {Float} [frequency] Frequency at which touch events are gathered and sent from the device. (Milliseconds)
  
  **/
  
  enableTouch: function(enable){
    var self = this;
    
    this.touchEnabled = enable;
  
    setTimeout(function(){
      bm.getFlashObj().EnableTouch(self.id,enable, frequency);
    },2E3)
  },
  /**
  Enable/Disable accelerometer events.
  
  Accelerometer events are off by default to reduce network traffic and should only be enabled if you are doing touch based controls. 
  
  @method enableAccelerometer
  @param {Bool} enable If 'true' touches are enabled, if 'false' touches are disabled.
  @param {Float} [frequency] Frequency at which touch events are gathered and sent from the device. (Milliseconds)
  
  **/
  
  enableAccelerometer: function(enable, frequency){
    var self = this;
    
    this.accelerometerEnabled = enable;
    this.accelerometerFrequency = frequency;
  
    setTimeout(function(){
      bm.getFlashObj().EnableAccelerometer(self.id,enable, frequency);
    },2E3)
  },
  
  /**
  Set which controller mode the device is in.
  
  @method setMode
  @param {String} mode Which mode do you want to set?
  
    **"gamepad"** Show your custom controller layout.
    
    **"keyboard"** Show the built in keyboard input layout.
    
    **"navigation"** Show the built in navigation input layout.
  
    **"wait"** Show the waiting/loading screen. 
  
  **/
  setMode: function(mode){
    if(this.mode==mode){
      return;// Ignore if not different
    }
    
    this.mode = mode;
    switch(mode){
      case "gamepad":
        if( bm.getFlashObj()!==undefined && bm.getFlashObj().SetGamepadMode!==undefined){
          bm.getFlashObj().SetGamepadMode(this.mode);
        }
        break;
      case "keyboard":
        if( bm.getFlashObj()!==undefined && bm.getFlashObj().SetKeyboardMode!==undefined){
          bm.getFlashObj().SetKeyboardMode(this.mode);
        }
        break;
      case "navigation":
        if( bm.getFlashObj()!==undefined && bm.getFlashObj().SetNavMode!==undefined){
          bm.getFlashObj().SetNavMode(this.mode);
        }    
        break;
      case "wait":
        if( bm.getFlashObj()!==undefined && bm.getFlashObj().setWaitMode!==undefined){
          bm.getFlashObj().setWaitMode(this.mode);
        }    
        break;
    }  
  },
  
  /**
  Get which controller mode the device is in.
  
  @method getMode
  @return {String} **"gamepad"**, **"keyboard"**, **"navigation"**, or **"wait"**.
  
  **/
  getMode: function(mode){
    return this.mode;
  }
  
});

})(BrassMonkey);