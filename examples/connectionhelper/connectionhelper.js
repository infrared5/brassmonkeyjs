(function(){

// Create Connection helper namespace
connectionHelper = {};

var isVisible = true;

connectionHelper.init = function(swf,parentElemId,cb){

  connectionHelper.flashObjectId = parentElemId;

  var swfVersionStr = "0.0.0",
      xiSwfUrlStr = "",
      flashvars = {},
      params = {},
      attributes = {};
      
  params.quality = "high";
  params.bgcolor = "#000000";
  params.allowscriptaccess = "always";
  params.allowFullScreen = "false";
  
  attributes.id = parentElemId;
  attributes.name = "ConnectionHelper";
  attributes.align = "middle";
    
  
    
  swfobject.embedSWF(
      swf, parentElemId, 
      "100%", "100%", 
      swfVersionStr, xiSwfUrlStr, 
      flashvars, params, attributes,
      function(e){
        if( e.success===true ){
          var flashObj = document.getElementById(connectionHelper.flashObjectId);
          flashObj.style.position = "absolute";
          
          if(isVisible){
            connectionHelper.show();
          } else {
            connectionHelper.hide();
          }
          
          if(cb!==undefined){
            cb();
          }
          
        }
      });

  bm.onDeviceConnected(function(device){
    if(bm.getControllerCount()==1){
      var flashObj = document.getElementById(connectionHelper.flashObjectId);
      flashObj.shutDownHelper();
    }
  });
}

connectionHelper.show = function(){
  var flashObj = document.getElementById(connectionHelper.flashObjectId);
  flashObj.style.display = "block";
  
  isVisible = true;
}

connectionHelper.hide = function(){
  var flashObj = document.getElementById(connectionHelper.flashObjectId);
  flashObj.style.display = "none";
  
  isVisible = false;
}

// Create helper object for brassmonkey.swf to call into
bm.helper={};
bm.helper.onShowSlot=function(val){
  var flashObj = document.getElementById(connectionHelper.flashObjectId);
  flashObj.setSlot(val);     
};
 
bm.helper.helperTick=function(msg){
  var flashObj = document.getElementById(connectionHelper.flashObjectId);
  flashObj.onTick(msg);  
};
 
bm.helper.printHelp=function(msg){
  var flashObj = document.getElementById(connectionHelper.flashObjectId);
  flashObj.printHelp(msg); 
}
  
bm.helper.setState= function (value){           
  var flashObj = document.getElementById(connectionHelper.flashObjectId);
  flashObj.setState(value);
};


})();