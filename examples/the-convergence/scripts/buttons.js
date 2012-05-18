(function(){

buttons = {};
buttons.init = function(layout,cb){
var buttons = {},
    lastTouch = {},
    width = Math.floor(320),
    height = Math.floor(480),
    // Track touches that are over the left and right buttons
    buttonTouchLists = {};

// Scan layout for images labeled as simulated buttons
for(var b = 0; b<layout.length;b++){
  if(layout[b].button!==undefined){
    buttons[layout[b].button] = layout[b];
    buttonTouchLists[layout[b].button] = {};
  }
}

function makeId(touch,deviceId){
  return deviceId+touch.id;
}
  
function isOverButton(x,y,button){
  if( x>button.x&&x<(button.x+button.width)&&
      y>button.y&&y<(button.y+button.height)){
    return true;
  } else{
    return false;
  }
}

function isEmptyObject(obj){
  for(var f in obj){
    return false;
  }
  return true;
}

bm.onTouchesReceived(function(touch,deviceId){
  var x = Math.floor(touch.x/320*width),
      y = Math.floor(touch.y/(480)*height);

  

  // Touch Start
  if(touch.phase.value==1){
    lastTouch[makeId(touch,deviceId)] = {
      x: x,
      y: y
    };
    
    // Check if this is over a button
    for(var b in buttons){
      if(isOverButton(x,y,buttons[b])){
        // If this is the first touch on this button generate a down event
        if(isEmptyObject(buttonTouchLists[b])){

          cb(b,true,deviceId);
        }
        // Add to buttonTouchLists list for that button
        buttonTouchLists[b][makeId(touch,deviceId)] = makeId(touch,deviceId);
      }
    }
  } 
  // Touch Move
  else if(touch.phase.value==2){
    lastTouch[makeId(touch,deviceId)] = {
      x: x,
      y: y
    };

    // Go through each button and update it's state based on if this
    // touch moved onto or off of it.
    for(var b in buttons){
      if(isOverButton(x,y,buttons[b])){
        // If this is the first touch on this button generate a down event
        if(isEmptyObject(buttonTouchLists[b])){
          cb(b,true,deviceId);
        }
        // Add to buttonTouchLists list for that button
        buttonTouchLists[b][makeId(touch,deviceId)] = makeId(touch,deviceId);
      } else{
        // If this touch was in the buttons touch list remove it. Then check if
        // it was the last one in the list if it was removed.
        if( buttonTouchLists[b][makeId(touch,deviceId)]!==undefined){
          delete buttonTouchLists[b][makeId(touch,deviceId)];
          if(isEmptyObject(buttonTouchLists[b])){

            cb(b,false,deviceId);
          }        
        }
      }
    }
  } 
  // Touch End
  else if(touch.phase.value==4){
    lastTouch[makeId(touch,deviceId)] = undefined;
    // Go through each button and update it's state based on if this touch was
    // over it.
    for(var b in buttons){
      // If this touch was in the buttons touch list remove it. Then check if
      // it was the last one in the list if it was removed.
      if( buttonTouchLists[b][makeId(touch,deviceId)]!==undefined){
        delete buttonTouchLists[b][makeId(touch,deviceId)];
        if(isEmptyObject(buttonTouchLists[b])){
          cb(b,false,deviceId);
        }
      }
    }
  }      
});

} 
})();