(function(){
      
  DPad = function(images,layout){
    // Configurations
    var dpadOffsetX = 41,
        dpadOffsetY = 144,
        dpadWidth = 358,
        dpadHeight = 358,
        dpadDeadZone = 32,
        dpadHalfDeadZone = dpadDeadZone/2,
        dpadCenterX = dpadOffsetX+dpadWidth/2,
        dpadCenterY = dpadOffsetY+dpadHeight/2,
        // Hitzone Generation Vars
        smallestSize = 8,
        largestSize = 256,
        dpadRangeWidth = dpadOffsetX*2+dpadWidth,
        dpadRangeHeight = 640,
        // Draw Mode
        //    "normal" Draws Regularly
        //    "hitrects" Makes the controller display the HitRects of all Rects
        drawMode = "hitrects",        
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
    images.push('transparent.png');
    
    // Hitrect Draw Mode images
    if(drawMode=="hitrects"){
      images.push('red.png');
      images.push('green.png');
      images.push('hitrect-up.png');
      images.push('hitrect-upright.png');
      images.push('hitrect-right.png');
      images.push('hitrect-downright.png');
      images.push('hitrect-down.png');
      images.push('hitrect-downleft.png');
      images.push('hitrect-left.png');
      images.push('hitrect-upleft.png');
    }
    
    // We'll make the neutral state of the dpad
    // be the in the background and the downstate
    // of dpad arrows will cover it up when they 
    // are active
    layout.push({
      type:   "image",
      image:  getImageIndex('dpad.png',images),
      x:      dpadOffsetX,
      y:      dpadOffsetY,
      width:  dpadWidth,
      height: dpadHeight
    });
    
    generateHitRects();
    
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
    
    function generateHitRects(){
      for(var y=0; y<dpadRangeHeight;y+=largestSize){
        for(var x=0; x<dpadRangeWidth;x+=largestSize){
          splitHitRect(x,y,largestSize);
        }
      }
      console.log("There are "+layout.length+" layout elements.");
    }
    
    function splitHitRect(x,y,size){
      var cls = classifyHitRect(x,y,size);
      
      // Don't create any buttons in the deadzone
      if(cls=="deadzone")
        return;
      
      // Either split up the rect or generate a
      // Button if it's cleanly in a angle hitzone
      if(cls=="split"){
        // Split into four new hit rects
          // Top Left
        splitHitRect(x,y,size/2);
          // Top Right
        splitHitRect(x+size/2,y,size/2);
          // Bottom Right
        splitHitRect(x+size/2,y+size/2,size/2);
          // Bottom Left
        splitHitRect(x,y+size/2,size/2);
      } else {
        var elem = {
              type:       "button",
              handler:    cls
            };
    
        // Normal Draw Mode?
        if(drawMode=="normal"){
          elem.imageUp    = getImageIndex('transparent.png',images);
          elem.imageDown  = getImageIndex('dpad-'+cls+'.png',images);
          elem.x          = dpadOffsetX;
          elem.y          = dpadOffsetY;
          elem.width      = dpadWidth;
          elem.height     = dpadHeight;
          elem.hitRect    = {
              x: x,
              y: y,
              width: size,
              height: size
            };
        } 
        // Hitrect Draw Mode
        else{
          elem.imageUp    = getImageIndex('hitrect-'+cls+'.png',images);
          elem.imageDown  = getImageIndex('transparent.png',images);
          elem.x          = x;
          elem.y          = y;
          elem.width      = size;
          elem.height     = size;
        }
        
        // Add this button to the Layout
        layout.push(elem);
      }
    }
    function classifyHitRect(x,y,size){
      // If the deadzone intersects the rect we need to split
      if( !(x>(dpadCenterX+dpadHalfDeadZone)||
          (x+size)<(dpadCenterX-dpadHalfDeadZone)||
          y>(dpadCenterY+dpadHalfDeadZone)||
          (y+size)<(dpadCenterY-dpadHalfDeadZone))){
          
        // If we're already at smallest allowed hitrect
        // size then just drop this hitrect
        return size>smallestSize?"split":"deadzone";
      }
    
      // Classify all the points
      var cls = [
          classifyPoint(x,y),           // Top Left
          classifyPoint(x+size,y),      // Top Right
          classifyPoint(x+size,y+size), // Bottom Right
          classifyPoint(x,y+size)       // Bottom Left
        ];
          
      // Are they all the same?
      if( cls[0]==cls[1]&&
          cls[1]==cls[2]&&
          cls[2]==cls[3] ){
        return cls[0];
      } 
      // If they aren't all the same split them up,
      // unless we're already at size=smallestSize, in which case
      // we stop tesselating and just pick whatever it's
      // center point classifies as
      else {
        if(size==smallestSize){
          var newCls = classifyPoint(x+size/2,y+size/2);
          return newCls;  
        } else {
          return "split";
        }
      }
    }
    
    function getAngle(x,y){
      return Math.floor(
        360-((Math.atan2(x,y)/Math.PI*180)+180)  
      );
    }
    
    function getZone(degrees){
      // Special Case for Up Zone
      if( degrees>(360-24) || degrees<23 ){
        return 0;
      } 
      return Math.floor((degrees-22)/45)+1;
    }
    
    function classifyPoint(x,y){
      var zonesLookUp = [
        "up",
        "upright",
        "right",
        "downright",
        "down",
        "downleft",
        "left",
        "upleft",
        "up"
      ];
    
      var angleInDegrees = getAngle(x-dpadCenterX,y-dpadCenterY),
          zone = getZone(angleInDegrees);
      return zonesLookUp[zone];
    }
    
    function getImageIndex(url){
      for(var i = 0;i<images.length;i++){
        if(images[i]==url){
          return i;
        }
      }
    }
  }
})();