(function(){

// Create Connection helper namespace
miniconnectionHelper = {};

var isVisible = true;

miniconnectionHelper.init = function(swf,parentElemId,cb,fv){

  miniconnectionHelper.flashObjectId = parentElemId;

  var swfVersionStr = "0.0.0",
      xiSwfUrlStr = "",
      flashvars = fv || {},
      params = {},
      attributes = {};
      
  params.quality = "high";
  params.bgcolor = "#000000";
  params.allowscriptaccess = "always";
  params.allowFullScreen = "false";
  
  attributes.id = parentElemId;
  attributes.name = "MiniConnectionHelper";
  attributes.align = "middle";
  
  swfobject.embedSWF(
      swf, parentElemId, 
      "451", "275", 
      swfVersionStr, xiSwfUrlStr, 
      flashvars, params, attributes,
      function(e){
        if( e.success===true ){
          var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
          flashObj.style.position = "absolute";
          
          if(isVisible){
            miniconnectionHelper.show();
          } else {
            miniconnectionHelper.hide();
          }
          
          if(cb!==undefined){
            cb();
          }
          
        }
      });

  bm.onDeviceConnected(function(device){
    if(bm.getControllerCount()==1){
      var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
      flashObj.shutDownHelper();
    }
  });
}

miniconnectionHelper.show = function(){
  var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
  flashObj.style.display = "block";
  
  isVisible = true;
}

miniconnectionHelper.hide = function(){
  var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
  flashObj.style.display = "none";
  
  isVisible = false;
}

// Create helper object for brassmonkey.swf to call into
bm.helper={};
bm.helper.onShowSlot=function(val){
  var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
  flashObj.setSlot(val);     
};
 
bm.helper.helperTick=function(msg){
  var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
  flashObj.onTick(msg);  
};
 
bm.helper.printHelp=function(msg){
  var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
  flashObj.printHelp(msg); 
}
  
bm.helper.setState= function (value){           
  var flashObj = document.getElementById(miniconnectionHelper.flashObjectId);
  flashObj.setState(value);
};


})();