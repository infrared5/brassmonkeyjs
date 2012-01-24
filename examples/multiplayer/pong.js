init = function (){ 
  var cvs = document.getElementById('canvas'),
      ctx = cvs.getContext('2d'),
      width = 512+128,
      height = 512+128,
      paddleWidth = width/15;
  cvs.width = width;
  cvs.height = height;
  
  // For testing purposes uncomment this to test N>0 player
  // rendering code without connecting
  //var fakeControllerCount = 2;
  
  ctx = cvs.getContext('2d');
  
  // Clear the canvas to black to start
  ctx.fillStyle="black";
  ctx.fillRect(0,0,width,height);
    
  // Line Caps/Joins to be round
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.lineWidth = 4;
  
  // Time is in seconds
  var lastTime = (new Date).getTime()/1000; 
  function loop(){
  
    // Calculate the amount of time that's passed
    // since our last update
    var newTime = (new Date).getTime()/1000,
        timeElapsed = newTime-lastTime;
    lastTime = newTime;      

    ctx.fillStyle="black";      
    ctx.fillRect(0,0,width,height);
    
    drawCourt();
    drawPlayers();
  }
  
  function int(f){
    return Math.floor(f);
  }
  
  function getSegment(controllerIdx){
    var count = window['fakeControllerCount']!==undefined?fakeControllerCount:bm.getControllerCount(),
        x0 = int(width/2+Math.sin(controllerIdx/count*Math.PI*2)*(width/2-paddleWidth)),
        y0 = int(height/2-Math.cos(controllerIdx/count*Math.PI*2)*(width/2-paddleWidth)),
        x1 = int(width/2+Math.sin((controllerIdx+1)/count*Math.PI*2)*(width/2-paddleWidth)),
        y1 = int(height/2-Math.cos((controllerIdx+1)/count*Math.PI*2)*(width/2-paddleWidth));
    return {x0:x0,y0:y0,x1:x1,y1:y1};
  }
  
  function drawCourt(){
    var count = window['fakeControllerCount']!==undefined?fakeControllerCount:bm.getControllerCount();
    
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle="white";
    
    // Special case for 2 players and down
    if(count<=2){

      ctx.moveTo(int(paddleWidth),int(paddleWidth));
      ctx.lineTo(int(width-paddleWidth),int(paddleWidth));
      ctx.lineTo(int(width-paddleWidth),int(height-paddleWidth));
      ctx.lineTo(int(paddleWidth),int(height-paddleWidth));
      ctx.lineTo(int(paddleWidth),int(paddleWidth));
    } else {  
      ctx.moveTo(int(width/2),int(paddleWidth));
      for(var i = 0;i<count;i++){
        var segment = getSegment(i);
        ctx.lineTo(segment.x1,segment.y1);
      }
    }
    ctx.stroke();
  }
  
  function drawPaddle(x0,y0,x1,y1,color){
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle=color;
    ctx.moveTo(int(x0),int(y0));
    ctx.lineTo(int(x1),int(y1));
    ctx.stroke();
  }
  
  function drawPlayers(){
    var count = window['fakeControllerCount']!==undefined?fakeControllerCount:bm.getControllerCount();
    
    // Draw nothing if there aren't at least 2 players
    if(count<2){
      return;
    // Special case for 2 player
    } else if(count==2){
      if(window['fakeControllerCount']!==undefined){
        drawPaddle(paddleWidth*1.5,height/2-paddleWidth,paddleWidth*1.5,height/2+paddleWidth,"red");
        drawPaddle(width-paddleWidth*1.5,height/2-paddleWidth,width-paddleWidth*1.5,height/2+paddleWidth,"green");
      } else {
        var controllers = bm.getControllers();
        drawPaddle(
          paddleWidth+6,players[controllers[0]].position*height-paddleWidth/2,
          paddleWidth+6,players[controllers[0]].position*height+paddleWidth/2,
          "red");
        drawPaddle(
          width-paddleWidth-6,players[controllers[1]].position*height-paddleWidth/2,
          width-paddleWidth-6,players[controllers[1]].position*height+paddleWidth/2,
          "green");
      }
    } else {
      
    }
  }
  
  setInterval(loop, 1000/16);
}