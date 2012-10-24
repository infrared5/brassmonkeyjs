(function(){
  DPad = function(images,layout){
    var dpadOffsetX = 41,
        dpadOffsetY = 144,
        arrowWidth = 130,
        arrowHeight = 114,
        // Inner hit rects
        smallerDpadOffsetX = dpadOffsetX+114,
        smallerDpadOffsetY = dpadOffsetY+114,
        smallerArrowWidth = 46,
        smallerArrowHeight = 42,
        // Draw Mode
        //    "normal" Draws Regularly
        //    "hitrects" Makes the controller display the HitRects of all Rects
        drawMode = "normal",
        // 
        states = {
          // State that is mutated as BM events come in
          internal:{
            left:0,
            right:0,
            up:0,
            down:0
          },
          current:{
            left:false,
            right:false,
            up:false,
            down:false
          },
          // Shadow state is updated each game loop
          // to hold the previous states of the dpad
          // buttons
          prev:{
            left:false,
            right:false,
            up:false,
            down:false
          }
        },
        // All arrow positions are relative to the dpad's
        // origin (dpadOffsetX,dpadOffsetY)
        arrows = {
          upleft:{
            x:          0+dpadOffsetX,
            y:          0+dpadOffsetY,
            width:      114,
            height:     114
          },
          up:{
            x:          114+dpadOffsetX,
            y:          0+dpadOffsetY,
            width:      130,
            height:     114
          },
          upright:{
            x:          244+dpadOffsetX,
            y:          0+dpadOffsetY,
            width:      114,
            height:     114
          },
          right:{
            x:          244+dpadOffsetX,
            y:          114+dpadOffsetY,
            width:      114,
            height:     130
          },
          downright:{
            x:          244+dpadOffsetX,
            y:          244+dpadOffsetY,
            width:      114,
            height:     114
          },
          down:{
            x:          114+dpadOffsetX,
            y:          244+dpadOffsetY,
            width:      130,
            height:     114
          },
          downleft:{
            x:          0+dpadOffsetX,
            y:          244+dpadOffsetY,
            width:      114,
            height:     114
          },
          left:{
            x:          0+dpadOffsetX,
            y:          114+dpadOffsetY,
            width:      114,
            height:     130
          },
          
          // Small
          upleftsmall:{
            x:          0+smallerDpadOffsetX,
            y:          0+smallerDpadOffsetY,
            width:      42,
            height:     42
          },
          upsmall:{
            x:          42+smallerDpadOffsetX,
            y:          0+smallerDpadOffsetY,
            width:      46,
            height:     42
          },
          uprightsmall:{
            x:          88+smallerDpadOffsetX,
            y:          0+smallerDpadOffsetY,
            width:      42,
            height:     42
          },
          rightsmall:{
            x:          88+smallerDpadOffsetX,
            y:          42+smallerDpadOffsetY,
            width:      42,
            height:     46
          },
          downrightsmall:{
            x:          88+smallerDpadOffsetX,
            y:          88+smallerDpadOffsetY,
            width:      42,
            height:     42
          },
          downsmall:{
            x:          42+smallerDpadOffsetX,
            y:          88+smallerDpadOffsetY,
            width:      46,
            height:     42
          },
          downleftsmall:{
            x:          0+smallerDpadOffsetX,
            y:          88+smallerDpadOffsetY,
            width:      42,
            height:     42
          },
          leftsmall:{
            x:          0+smallerDpadOffsetX,
            y:          42+smallerDpadOffsetY,
            width:      42,
            height:     46
          }
        };
  
    // Add Resources
    images.push('dpad.png');
    images.push('dpad-upleft.png');
    images.push('dpad-up.png');
    images.push('dpad-upright.png');
    images.push('dpad-right.png');
    images.push('dpad-downright.png');
    images.push('dpad-down.png');
    images.push('dpad-downleft.png');
    images.push('dpad-left.png');
    images.push('hitrect.png');
    images.push('transparent.png');
    
    // We'll make the neutral state of the dpad
    // be the in the background and the downstate
    // of dpad arrows will cover it up when they 
    // are active
    layout.push({
      type:   "image",
      image:  getImageIndex('dpad.png'),
      x:      dpadOffsetX,
      y:      dpadOffsetY,
      width:  358,
      height: 358
    });
    
    // Add HitRect Image if we're in the
    if(drawMode=="hitrects"){
      images.push('hitrect.png'); 
    }
    
    for(var arrow in arrows){
      var elem = {
            type:       "button",
            handler:    arrow
          },
          // Strip off the 'small' part of the arrow's field name
          // so we know which state image it goes with
          realName = arrow.replace('small');
    
      // Normal Draw Mode?
      if(drawMode=="normal"){
        elem.imageUp    = getImageIndex('transparent.png');
        elem.imageDown  = getImageIndex('dpad-'+realName+'.png');
        elem.x          = dpadOffsetX;
        elem.y          = dpadOffsetY;
        elem.width      = 358;
        elem.height     = 358;
        elem.hitRect    = {
          x: arrows[arrow].x,
          y: arrows[arrow].y,
          width: arrows[arrow].width,
          height: arrows[arrow].height
        };
      } 
      // Hitrect Draw Mode
      else{
        elem.imageUp    = getImageIndex('hitrect.png');
        elem.imageDown  = getImageIndex('transparent.png');
        elem.x          = arrows[arrow].x;
        elem.y          = arrows[arrow].y;
        elem.width      = arrows[arrow].width;
        elem.height     = arrows[arrow].height;
      }
    
      // Add this button to the Layout
      layout.push(elem);
    }
    
    
    function getImageIndex(url){
      for(var i = 0;i<images.length;i++){
        if(images[i]==url){
          return i;
        }
      }
    }
    
    this.getState = function(which){
      return states.current[which];
    }
    
    this.getPrevState = function(which){
      return states.prev[which];
    }
    
    this.getCurrentStateImage = function(){
      var str = "";
      
      // Up/Down
      if(states.current.up){
        str+="up";
      } else if(states.current.down){
        str+="down";
      }
      
      // Left/Right
      if(states.current.left){
        str+="left"
      } else if(states.current.right){
        str+="right"
      }
      
      // Is anything even pressed?
      if(str==""){
        str = "dpad.png";
      } else {
        str = "dpad-"+str+".png";
      }
      
      
      return str;
    }
    
    // Callback register for dpad events
    this.on = function(cb){
      this.cb = cb;
    }
    
    // Clients of this class should call this at the beginning
    // of their game loops
    this.update = function(){
      
      // Update the prev state with the new state
      // and generate events for any state that has
      // changed
      for(s in states.current){
        
        // Copy Old Current State to Previous
        states.prev[s] = states.current[s];
        
        // Copy Internal State into Current
        states.current[s] = states.internal[s]!=0;
        
        // Generate events for changes in states
        if( this.cb!==undefined&&
            states.current[s]!=states.prev[s]){
          this.cb(s, states.current[s]);
        }
      }
    }
    
    bm.onInvocation(function(invoke, deviceId){
      var keyDown = invoke.parameters[0].Value=="down",
          realName = invoke.methodName.replace('small');
     
      // Figure out which states this button affects
      for(s in states.current){
        if(realName.search(s)!=-1){
          
          // Do reference count of fingers over a button
          if(keyDown){
            states.internal[s] += 1;
          } else {
            states.internal[s] -= 1;
          }
        }
      }
    });
  }
})();