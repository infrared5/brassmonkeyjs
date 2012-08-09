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

})(BrassMonkey);