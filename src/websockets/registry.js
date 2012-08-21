(function(bm) {

var registryUrl = "ws://76.104.235.243:6262/registry";

var BMInvoke = function (method,returnMethod,data){
  this.methodName = method;
  this.returnMethod = returnMethod;
  this.data = data;
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

var RegistryConnection = function(options) {   
  this.uri = registryUrl;
  this.websocket = null;
  this.clientInfo = {
    appId : options.appId,
    device : new BMDevice(options.deviceId, options.name),
    address : new BMAddress("192.168.2.1", 6666), //< contents of address do not matter
    slotId : 2,
    maxPlayers : options.maxPlayers,
    currentPlayers : 0
  };   
};

var rcp = RegistryConnection.prototype;
  
rcp.start = function() {
  var websocket = this.websocket = new WebSocket(this.uri);
  websocket.onopen = bind(this.onOpen, this);
  websocket.onclose = bind(this.onClose, this);
  websocket.onmessage = bind(this.onMessage, this);
  websocket.onerror = bind(this.onError, this);
  console.log("connecting to registry ");
};

rcp.stop = function() {
  var websocket = this.websocket;
  websocket.onopen = websocket.onclose = websocket.onmessage = websocket.onerror = null;
  websocket.close();
};

rcp.onOpen = function(event){
  //event.open
  var invoke = new BMInvoke("registry.register", "onRegister" , [this.clientInfo]);
  invoke.ws=32;
  var payload=JSON.stringify(invoke); 

  this.websocket.send(payload);
  console.log("sent register request "+payload);
};

rcp.onClose = function(event){
  // TODO: event.close
  console.log("registry closed");
};

rcp.onError = function(event){
  // TODO: event.error
  console.log("registry error");
};

rcp.onMessage = function(event){
  console.log(event.data);
  //event.message
  var myObject = JSON.parse(event.data);

  switch (myObject.ws) {

  case 32://invoke
    var i = myObject.data.length;
    var j = 0;
    var parameters = [];
            
    while (j < i) {
      t = myObject.data[j++].value;       
      parameters.push(t);
    }
    
    fn = this[myObject.methodName];
    if(typeof fn === 'function') {        
        fn.apply(this, parameters);
    }else{
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

rcp.onHostConnected = function(hostInfo) {
  if(hostInfo.device.deviceId == this.clientInfo.device.deviceId){
    this.clientInfo = hostInfo;   
    console.log("Woo Im connected ");
  }
};

rcp.deviceConnectRequested = function(clientInfo){
  console.log("Device wants to connect! "+clientInfo.address.host);
  this.onconnectrequest(clientInfo);
};

bm.RegistryConnection = RegistryConnection;

})(BrassMonkey);