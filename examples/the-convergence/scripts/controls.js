
// Initialize Brass Monkey
bm.init({
  // The Name that will be displayed on phone when
  // trying to connect to the game to control it.
  name: "The Convergence",
  
  // This game is single player, set it's max players accordingly
  bmMaxPlayers:1,
  
  // Use this appID for now. We are building our developer portal
  // back end as we speak.
  bmAppId:"dfbc9769ef641e415aac8ee86224c9fa",
  
  // Location of the brassmonkey.swf the SDK depends on.
  // Coming soon this dependency will be removed for platforms
  // like Mobile Safari that don't support flash.
  swfURL:"../../src/swf/bin/brassmonkey.swf",
  
  // Describe the controller's design/layout
  design: {
    // Which orientation is your controller designed for
    orientation: "landscape",
    
    // Disable touch/accelerometer if you aren't using it
    // to improve network performance.
    touchEnabled: false,
    accelerometerEnabled: false,
    
    // List of images used for this controller
    images:[
      'images/background.png',
      'images/left.png',
      'images/left-down.png',
      'images/right.png',
      'images/right-down.png',
      'images/flip.png',
      'images/flip-down.png'
    ],
    
    // List of all the images/buttons in the controller layout
      // Attributes
      //  Images and Buttons
      //    type                    | 'image' or 'button'
      //    x,y,width, and height   | Position of elements (in pixels)
      //  Images only
      //    image                   | zero based index of the image to display
      //                            | from the 'images' list
      //  Buttons only
      
      
      
    layout:[{
        type:       "image",
        image:      0,
        x:          0,
        y:          0,
        width:      480,
        height:     320
      }, {
        type:       "button",
        handler:    "left",
        imageUp:    1,
        imageDown:  2,
        x:          0,
        y:          113,
        width:      103,
        height:     103
      }, {
        type:       "button",
        handler:    "right",
        imageUp:    3,
        imageDown:  4,
        x:          167,
        y:          113,
        width:      103,
        height:     103
      }, {
        type:       "button",
        handler:    "flip",
        imageUp:    5,
        imageDown:  6,
        x:          280,
        y:          92,
        width:      192,
        height:     146
      }]
  }
});

// Listen for button events 
bm.onInvocation(function(invoke, deviceId){
  // Is the button up or down now
  var isDown  = invoke.parameters[0].Value=="down";
  
  // Which button was it? ('left', 'right', or 'flip')
  var button  = invoke.methodName;
      
  // Special logic for starting the game if we're
  // on the home screen and the user presses the 'flip' button
  if(button=="flip"&&isDown&&startGame()){
    return;
  }
  
  // Button Down  
  if(isDown){
    emulatedKeyDown(button);
  } else {
  // Button Up
    emulatedKeyUp(button);
  }
});


bm.onShowSlot(function(color){
  // Todo: Display the slot color somewhere on the game's screen. 
  // This is the color that shows up in the device list on the controller for
  // selecting what game/pc to connect to in order to control it.
  // It's a CSS hex style color (ie. #ff0000)
});