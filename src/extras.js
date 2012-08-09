(function(bm){

/*
Code for integration of Brass Monkey into the Brass Monkey Console
*/

var pingCBInterval,
    perDeviceAttributes = {},
    doPings = false;

bm.doPingTrick = function(_doPings){
  // Early out if there is no change
  if(_doPings==doPings){
    return;
  }
  doPings = _doPings;
  
  if(doPings){
    pingCBInterval = setInterval(function(){
        bm.setNavMode();
    },16);
  } else {
    clearInterval(pingCBInterval);
  }
}

bm.SetWaitForNewHost = function(appId,players){
  bm.getFlashObj().SetWaitForNewHost(appId,players);
}

var visibility = true;
bm.setVisibility = function(visible){
  if( bm.getFlashObj()!==undefined && bm.getFlashObj().SetVisibility!==undefined){
    if(visibility==visible){
      return;
    }
    bm.getFlashObj().SetVisibility(visible,true);
    visibility = visible;
  }
}

bm.getVisibility = function(){
  return visibility;
}

})(BrassMonkey);