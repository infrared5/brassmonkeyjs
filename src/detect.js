(function(bm){

var deviceIphone = "iphone",
    deviceIpod = "ipod",
    deviceIpad = "ipad",
    // Initialize our user agent string to lower case.
    uagent = navigator.userAgent.toLowerCase();
 
// Detects if the current device is an iPhone.
bm.detectIphone = function() {
	return (uagent.search(deviceIphone) > -1)
}
 
// Detects if the current device is an iPad.
bm.detectIpad = function() {
	return (uagent.search(deviceIpad) > -1)
}
 
// Detects if the current device is an iPod Touch.
bm.detectIpod = function () {
	return (uagent.search(deviceIpod) > -1)
}
 
// Detects if the current device is an iOS device
bm.detectIOS = function() {
	if (bm.detectIphone())
		return true;
	else if (bm.detectIpod())
		return true;
	else if (bm.detectIpad())
		return true;
	else
		return false;
}

bm.detectAndroid = function(){
  // Is it android?
  var ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("android") > -1; 
}

// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
bm.detectInternetExplorerVersion = function(){
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

bm.detectRuntime = function(){
  return "websockets";
  
  if(bm.detectIOS()){
    return "websockets";
  } else {
    return "flash";
  }
}

})(BrassMonkey);