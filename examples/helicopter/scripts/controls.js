(function(){

// ----------------------------
// Setup Brass Monkey Controls
// ----------------------------
bm.init({
  name: "Helicopter",
  bmMaxPlayers:1,
  design: {
    orientation: "landscape",
    touchEnabled: false,
    accelerometerEnabled: true,
    images:[
      'images/background.png',
      'images/up.png',
      'images/up-pressed.png',
      'images/down.png',
      'images/down-pressed.png',
      'images/shoot.png',
      'images/shoot-pressed.png'
    ],
    // Layout of buttons/images on the controller.
    // Controller is designed for 960px x 640px
    layout:[{
        type:   "image",
        image:  0,
        x:      0,
        y:      0,
        width:  960,
        height: 640
      }, {
        type:       "button",
        handler:    "up",
        imageUp:    1,
        imageDown:  2,
        x:          131,
        y:          158,
        width:      250,
        height:     240
      }, {
        type:       "button",
        handler:    "down",
        imageUp:    3,
        imageDown:  4,
        x:          131,
        y:          401,
        width:      250,
        height:     240
      }, {
        type:       "button",
        handler:    "shoot",
        imageUp:    5,
        imageDown:  6,
        x:          528,
        y:          222,
        width:      394,
        height:     371
    }]
  }
});
    
// When a controller connects, turn up accelerometer sampling to 60hz
bm.onDeviceConnected(function(device){
  bm.enableAccelerometer(device.deviceId,true,1.0/30.0);
});

var acceleration = {x:0,y:0,z:0};
bm.onAccelReceived(function(e){
  // Store last accelerometer position for use in the next pass
  // through the game loop
  acceleration = e.acceleration;
});

// Listen for button presses for the up, down, and shoot buttons
var buttonStates = {
      up: false,
      down: false,
      shoot: false
    };
bm.onInvocation(function(invoke, deviceId){
  var keyDown = invoke.parameters[0].Value=="down",
      button = invoke.methodName;
  
  // Update the button states
  buttonStates[button] = keyDown;
});

// Optional: Show the matching slot color on the screen to make connecting easier when multiple games
// are running on the same network to reduce confusion
bm.onShowSlot(function(color){
  document.getElementById('slot').style.background = color;
});

// ----------------------------
// Setup Basic Game
// ----------------------------
  // Basic world/character vars
var worldWidth = 800,
    worldHeight = 600,
    playerWidth = 16,
    playerHeight = 16,
    playerHorizontalAccel = 20, // 
    playerVerticalAccel = 30,   // Pixels per second
    gravity = 15, // Pixels per second
    deccel = 0.90,
    bounceCoEfficient = 0.75,
    // Position player on the ground
    playerX = worldWidth/2-playerWidth/2,
    playerY = worldHeight-playerHeight/2,
    playerSpeedX = 0,
    playerSpeedY = 0;

// Create a game loop at 60 Frames/Second
var lastUpdateTime = (new Date()).getTime();
setInterval(function(){
  var newUpdateTime = (new Date()).getTime();
      changeInTime = (newUpdateTime-lastUpdateTime)/1000; // Time is in seconds
  
  gameLoop(changeInTime);
  
  lastUpdateTime = newUpdateTime;
},1000/60);// 

// Initialize the canvas
var cvs = document.getElementById('world'),
    ctx = cvs.getContext('2d');
  // Set it's dimensions based on the world's size    
cvs.width = worldWidth;
cvs.height = worldHeight;
  // Clear it to white
ctx.fillStyle = 'rgba(255,255,255,1)';
ctx.fillRect(0, 0, cvs.width, cvs.height);

    
function gameLoop(changeInTime){
  // Update Sim
    // Update the horizontal speed of player based on the last accelerometer
  playerSpeedX += -acceleration.y*playerHorizontalAccel*changeInTime;
    // Update the vertical speed of the player based on the up/down button states
  if(buttonStates['up']){
    playerSpeedY -= playerVerticalAccel*changeInTime;
  }
  if(buttonStates['down']){
    playerSpeedY += playerVerticalAccel*changeInTime;
  }
  
    // Apply Gravity 
  playerSpeedY += gravity*changeInTime;  
    // Decellerate Speed
  playerSpeedX*=deccel;
  playerSpeedY*=deccel;
    // Update the player position based on it's speed
  playerX += playerSpeedX;
  playerY += playerSpeedY;
    // Bounce the player when they hit the edge of the screen
      // Clip Left
  if(playerX<0){
    playerX = 0;
    playerSpeedX = -playerSpeedX*bounceCoEfficient;
  }
      // Clip Right
  if(playerX>worldWidth){
    playerX = worldWidth;
    playerSpeedX = -playerSpeedX*bounceCoEfficient;
  }
      // Clip Top
  if(playerY<0){
    playerY = 0;
    playerSpeedY = -playerSpeedY*bounceCoEfficient;
  }
      // Clip Bottom
  if(playerY>worldHeight){
    playerY = worldHeight;
    playerSpeedY = -playerSpeedY*bounceCoEfficient;
  }
  

  // Draw the world
    // Clear the canvas (With a small bit of transparent for a blur effect)
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
    // Draw the character as a red block
  ctx.fillStyle = 'rgba(255,0,0,1)';
  ctx.fillRect(playerX-playerWidth/2, playerY-playerHeight/2, playerWidth, playerHeight);
}

})();