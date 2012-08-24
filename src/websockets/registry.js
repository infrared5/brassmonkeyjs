(function(bm) {

var registryUrl = "ws://76.104.235.243:6262/registry";

var BMInvoke = function (method,returnMethod,data){
  this.methodName = method;
  this.returnMethod = returnMethod;
  this.data = data;
  this.ws=32;
};

var BMAddress = function(host, port) {
  this.host = host;
  this.reliablePort = port;
  this.unreliablePort = port;
  
};

var BMDevice = function(deviceId, deviceName) {
  this.deviceId = deviceId;
  this.deviceName = deviceName;
  this.deviceType = "WEBSOCKET";
  this.encodeType = 18; 
};

var BMInfo = function(appId, device, address, slot, max, current) {
  this.appId = appId;
  this.device = device;
  this.address = address;
  this.slotId = slot;
  this.maxPlayers = max;
  this.currentPlayers = current;
};

// TODO: not duplicate
var bind = function(func, target) {
  return function() {
    func.apply(target, arguments);
  };
};

var debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

var RegistryConnection = function(options) {   
  this.uri = registryUrl;
  this.websocket = null;
  this.clientInfo = {
    appId : options.appId,
    device : new BMDevice(options.deviceId, options.name),
    address : new BMAddress("192.168.2.1", 6666), //< contents of address do not matter
    slotId : 1,
    maxPlayers : options.maxPlayers,
    currentPlayers : 0
  };
  this.update = debounce(bind(this.update, this), 500);
};

var rcp = RegistryConnection.prototype;
  
rcp.start = function() {
  var websocket = this.websocket = new WebSocket(this.uri);
  websocket.onopen = bind(this.onOpen, this);
  websocket.onclose = bind(this.onClose, this);
  websocket.onmessage = bind(this.onMessage, this);
  websocket.onerror = bind(this.onError, this);
  console.log("connecting to registry " + this.uri);
  this.cancelRetry();
};

rcp.stop = function() {
  var websocket = this.websocket;
  websocket.onopen = websocket.onclose = websocket.onmessage = websocket.onerror = null;
  websocket.close();
  this.cancelRetry();
};

rcp.cancelRetry = function () {
  if(typeof this.retry === "number") {
    clearTimeout(this.retry);
    delete this.retry;
  }
};

rcp.onOpen = function(event){
  //event.open
  var invoke = new BMInvoke("registry.register", "onRegister" , [this.clientInfo]),
      payload = JSON.stringify(invoke); 

  this.websocket.send(payload);
  console.log("sent register request %s", payload);
};

rcp.onClose = function(event){
  // TODO: event.close
  console.log("registry closed");
  bm.trigger("registrydisconnected", {});
  this.retry = setTimeout(bind(this.start, this), 1500);
};

rcp.onError = function(event){
  // TODO: event.error
  console.log("registry error");
};

var paramValues = function(data) {
  var length = data.length,
      i = 0,
      parameters = [];
            
  for (; i < length; ++i) {
    parameters[i] = data[i].value;  
  }
  return parameters;
};

rcp.onMessage = function(event) {
  //console.log(event.data);
  //event.message
  var message = JSON.parse(event.data);

  switch (myObject.ws) {

  case 32://invoke
    var parameters = paramValues(message.data),
        fn = this[myObject.methodName];

    if(typeof fn === 'function') {        
        fn.apply(this, parameters);
    } else {
      console.log('RegistryConnection function "%s" not found', myObject.methodName);
    }
    break;

  case 35://ping      
    break;
  }
};

rcp.onRegister = function(result) {
  if(!result){//failed, dispatch now. success, dispatch at onHostConnected
    console.log("Failed to register");
  }
};

rcp.setVisibility = function(visible) {
  var invoke = new BMInvoke("registry.setVisible", "", [{value:visible}, {value:true}]);
  this.websocket.send(JSON.stringify(invoke));
};

rcp.update = function() {
  var invoke = new BMInvoke("registry.register", "onRegister" , [this.clientInfo]);
  this.websocket.send(JSON.stringify(invoke));
};

rcp.setPlayerCount = function(playerCount) {
  this.clientInfo.currentPlayers = playerCount;
  this.update();
};

rcp.onHostConnected = function(hostInfo) {
  if(hostInfo.device.deviceId == this.clientInfo.device.deviceId){
    this.clientInfo = hostInfo;   
    console.log("Woo Im connected ");

    var slotIndex = Math.max(0, hostInfo.slotId-1) % bm.slotColors.length,
        slotColor = bm.slotColors[slotIndex];
    bm.trigger("showslotcolor", {slot: hostInfo.slotId, color: slotColor});
  }
};

rcp.deviceConnectRequested = function(clientInfo){
  console.log("Device wants to connect! "+clientInfo.address.host);
  this.onconnectrequest(clientInfo);
};

bm.RegistryConnection = RegistryConnection;

})(BrassMonkey);