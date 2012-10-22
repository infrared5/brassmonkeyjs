(function(){
  DPad = function(images,layout){
    var dpadOffsetX = 41,
        dpadOffsetY = 144,
        arrowWidth = 130,
        arrowHeight = 114,
        smallerArrowWidth = 46,
        smallerArrowHeight = 42,
        drawMode = "hitrects",  // "normal" Draws Regularly
                                // "hitrects" Makes the controller display the HitRects
                                // of all Rects
                                
        states = ['left','right','up','down'],

        // All arrow positions are relative to the dpad's
        // origin (dpadOffsetX,dpadOffsetY)
        arrows = {
          up:{
            x:          arrowHeight,
            y:          0,
            width:      arrowWidth,
            height:     arrowHeight
          },
          down:{
            x:          arrowHeight,
            y:          arrowHeight+arrowWidth,
            width:      arrowWidth,
            height:     arrowHeight
          },
          left:{
            x:          0,
            y:          arrowHeight,
            width:      arrowHeight,
            height:     arrowWidth
          },
          right:{
            x:          arrowHeight+arrowWidth,
            y:          arrowHeight,
            width:      arrowHeight,
            height:     arrowWidth
          }
        };
  
    images.push('dpad.png');
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
          };
    
      // Normal Draw Mode?
      if(drawMode=="normal"){
        elem.imageUp    = getImageIndex('transparent.png');
        elem.imageDown  = getImageIndex(arrow+'.png');
        elem.x          = dpadOffsetX;
        elem.y          = dpadOffsetY;
        elem.width      = 358;
        elem.height     = 358;
        elem.hitRect    = {
          x: arrows[arrow].x+dpadOffsetX,
          y: arrows[arrow].y+dpadOffsetY,
          width: arrows[arrow].width,
          height: arrows[arrow].height
        };
      } 
      // Hitrect Draw Mode
      else{
        elem.imageUp    = getImageIndex('hitrect.png');
        elem.imageDown  = getImageIndex('transparent.png');
        elem.x          = arrows[arrow].x+dpadOffsetX;
        elem.y          = arrows[arrow].y+dpadOffsetY;
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
  }
  
  
  
  bm.onInvocation(function(invoke, deviceId){
    var keyDown = invoke.parameters[0].Value=="down";
    if(keyDown){
      console.log(invoke.methodName+' is down.');
    } else {
      console.log(invoke.methodName+' is up.');
    }
  });
      

})();