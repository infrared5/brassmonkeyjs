/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, sub:true, maxerr:50 */
/*global WebSocket:false, BrassMonkey:true, unescape:false, escape:false */
(function(bm) {
"use strict";

// Enums
var PACKET_DATA = 0;
var PACKET_PING = 1;
var PACKET_ACK = 2;
var PACKET_ECHO = 3;
var PACKET_ANALYSIS = 4;
var PACKET_KEEP_ALIVE = 5;

var CHANNEL_BROADCAST = 0;
var CHANNEL_ACCELERATION = 1;
var CHANNEL_TOUCH = 2;
var CHANNEL_MESSAGE = 3;
var CHANNEL_SHAKE = 4;
var CHANNEL_BYTE = 5;
var CHANNEL_GYRO = 6;
var CHANNEL_ORIENTATION = 7;

var DEVICE_ANY = 0;
var DEVICE_UNITY = 1;
var DEVICE_IPHONE = 2;
var DEVICE_FLASH = 3;
var DEVICE_ANDROID = 4;
var DEVICE_NATIVE = 5;

var ENCODE_PACKET = 0;
var ENCODE_ADDRESS = 1;
var ENCODE_PARAMETER = 3;
var ENCODE_INVOKE = 4;
var ENCODE_ACCELERATION = 5;
var ENCODE_TOUCH_SET = 6;
var ENCODE_DEVICE_IPHONE = 7;
var ENCODE_DEVICE_UNITY = 8;
var ENCODE_DEVICE_ANDROID = 10;
var ENCODE_DEVICE_NATIVE = 15;
var ENCODE_DEVICE_PALM = 16;
var ENCODE_DEVICE_SERVER = 17;
var ENCODE_DEVICE_FLASH = 18;
var ENCODE_ACK = 9;
var ENCODE_PING = 11;
var ENCODE_SHAKE = 13;
var ENCODE_BYTE_CHUNK = 14;
var ENCODE_REGISTRY_INFO = 19;
var ENCODE_TAGGED_ARRAY = 21;
var ENCODE_GYRO = 22;
var ENCODE_ORIENTATION = 23;

var controlModes = {
  gamepad : 0,
  keyboard : 1,
  navigation : 2,
  wait : 3
};


var connections = [];

var packedVersion = packVersion({major:1, minor:4});

var localDevice = {
  id : "sadkldsjadsjladsjklsaklasdkljsadla",
  name : "dorian",
  type : DEVICE_FLASH,
  encodeType : ENCODE_DEVICE_FLASH
};

var localAddress = {
  hostname : "unknown",
  updPort : 0,
  tcpPort : 0,
  encodeType : ENCODE_ADDRESS
};

var removeConnection = function(connection) {
  var index = connections.indexOf(connections);
  if(index >= 0)  {
    connections.splice(index, 1);
    bm.removeDevice(connection);
  }
};

var bind = function(func, target) {
  return function() {
    func.apply(target, arguments);
  };
};

var makeInvoke = function(methodName, params) {
  return {
    method : methodName,
    returnMethod : "",
    params : params,
    encodeType : ENCODE_INVOKE
  };
};

var start = function(ipAddress) {
  bm.log("start");
  
  connections.push(new Connection("deviceId", ipAddress, 9011));
};

var stop = function() {
  var i;
  for(i = 0; i < connections.length; ++i) {
    bm.removeDevice(connections[i]); // < Should this be done?
    connections[i].close();
  }
  connections.length = 0;
  bm.log("stop");
};

var Connection = bm.Device.extend({
  init : function(deviceId, host, port) {
    var socket;
    this._super();
    this.id = deviceId;
    socket = this.socket = new WebSocket("ws://" + host + ":" + port);
    this.sequence = 0;
    this.capabilities = 0;

    this.touchEnabled = bm.options.design.touchEnabled;
    this.accelerometerEnabled = bm.options.design.accelerometerEnabled;

    var self = this;
    socket.onerror = bind(this.onError, this);
    socket.onclose = bind(this.onClose, this);
    socket.onmessage = bind(this.onVersion, this);
    socket.onopen = bind(this.onOpen, this);
  },

  onError : function() {
    removeConnection(this);
    bm.log("error");
  },

  onClose : function(/*closeEvent*/) {
    removeConnection(this);
    bm.log("DISCONNECTED");
  },

  onOpen : function() {
    var handshake = [packedVersion, packedVersion];
    this.socket.send(JSON.stringify(handshake));
    bm.log("CONNECTED");
  },

  onVersion : function(message) {
    var json = JSON.parse(message.data);
    bm.log("GOT VERSION");

    // TODO: verify version
    this.sendPacket({
      type : PACKET_ACK,
      message : {
        encodeType: ENCODE_ACK,
        device: localDevice,
        address: localAddress
      }
    });

    this.sendInvoke("setReliabilityForTouch", [['i', 2], ['i', 2]]);

    this.socket.onmessage = bind(this.onMessage, this);
  },

  setMode : function(mode, text) {
    if(this.mode !== mode) {
      if(!(mode in controlModes)) {
        throw new Error("unknown control mode " + mode);
      }

      this.mode = mode;
      var modeIndex = controlModes[mode];
      if(text !== undefined) {
        this.sendInvoke("SetControlMode", [['i',modeIndex], ['*',text]]);
      } else {
        this.sendInvoke("SetControlMode", [['i',modeIndex]]);
      }
    }
  },

  enableGyroscope : function (enabled) {
    if(enabled !== this.gyroEnabled) {
      this.gyroEnabled = enabled;
      this.sendInvoke("enableGyro", [['B', enabled]]);
    }
  },

  setGyroscopeInterval : function(interval) {
    if(interval !== this.gyroInterval) {
      this.gyroInterval = interval;
      this.sendInvoke("setGyroInterval", [['f',interval]]);
    }
  }

});

var cp = Connection.prototype;

var generateSensorMethods = function(name) {
  var capsName = name.charAt(0).toUpperCase() + name.slice(1),
      enabledField = name + "Enabled",
      intervalField = name + "Interval",
      enableMethod = "enable" + capsName,
      intervalMethod = "set" + capsName + "Interval";
  cp[enableMethod] = function (enabled) {
    if(enabled !== this[enabledField]) {
      this[enabledField] = enabled;
      this.sendInvoke(enableMethod, [['B', enabled]]);
    }
  };

  cp[intervalMethod] = function(interval) {
    if(interval !== this[intervalField]) {
      this[intervalField] = interval;
      this.sendInvoke(intervalMethod, [['f',interval]]);
    }
  };
};

generateSensorMethods('touch');
generateSensorMethods('accelerometer');
generateSensorMethods('orientation');

var notify = function(connection, type, event) {
  //TODO: remove debug log
  bm.log("notify: " + type);
  connection.trigger(type, event);
  bm.trigger(type, event);
};

cp.onMessage = function(message) {
  var json = JSON.parse(message.data),
      packet = decodePacket(json),
      channel = packet.channel;

  //bm.log("GOT MESSAGE: " + JSON.stringify(packet));
  if(CHANNEL_MESSAGE === channel) {
    this.handleInvoke(packet.message);
  }
  else if(CHANNEL_SHAKE === channel) {
    notify(this, "shake", {device: this});
  }
  else if(CHANNEL_ACCELERATION === channel) {
    notify(this, "acceleration", {device:this, acceleration:packet.message});
  }
  else if(CHANNEL_TOUCH === channel) {
  
    // Convert events to something more similar to web standards
    // TODO:  Revisit this as looking at the web standards they seem messier than they should be
    //        but the benefits of people being able to drop in brass monkey to replace existing
    //        may out weight that.
    var touches = packet.message.touches,
        len = touches.length;
    console.log(len);
    for(var i = 0; i<len;i++){
      // NOTE:  Touch ids are made from a combination of the device id and the in coming touch id
      //        so that they are unique for clients of the SDK to be able to identify them as unique
      //        if doing logic that combines the touch events coming from multiple devices.
      //        In practice when coding say multi user drawing apps this came up for me (Francois)
      //        allowing me to use the id of a particular touch coming from a particular device and know
      //        it's unique across all touches coming from all devices. The existing ids are only unique to
      //        a particular device.
      switch(touches[i].phase){
        case 1:
          notify(this, "touchstart", {device:this, x:touches[i].x, y:touches[i].y,id:this.id+touches[i].id});
          break;
        case 2:
          notify(this, "touchmove", {device:this, x:touches[i].x, y:touches[i].y,id:this.id+touches[i].id});
          break;
        case 4:
          notify(this, "touchend", {device:this, x:touches[i].x, y:touches[i].y,id:this.id+touches[i].id});
          break;
      }
    }
  }
  else if(CHANNEL_GYRO === channel) {
    notify(this, "gyroscope", {device:this, gyroscope:packet.message});
  }
  else if(CHANNEL_ORIENTATION === channel) {
    notify(this, "orientation", {device:this, orientation:packet.message});
  }
};

cp.close = function() {
  this.socket.close();
};

cp.handleInvoke = function(invoke) {
  switch(invoke.method) {
    case "RequestXML":
      this.sendControlScheme();
      break;

    case "GetPortalId":
      if(bm.options.portalId) {
        this.sendInvoke(invoke.returnMethod, [['*', bm.options.portalId]]);
      }
      break;

    case "setCapabilities":
      this.capabilities = invoke.params[0][1];
      bm.addDevice(this);
      break;

    case "onKeyString":
      notify(this, "keyboard", {device:this, text:invoke.params[0][1]});
      break;

    case "onControlSchemeParsed":
      break;

    case "WaitCancelled":
      // TODO: name?
      notify(this, "waitcancelled", {device:this});
      break;

    case "bmPause":
      // TODO: keep track of pause state?
      notify(this, "pause", {device:this});
      break;

    case "onNavigationString":
      // TODO: ?
      notify(this, "navstring", {device:this, string:invoke.params[0][1]});
      break;

    default:
      this.handleButtonInvoke(invoke);
      break;
  }
};

cp.handleButtonInvoke = function(invoke) {
  var firstParam;
  if(invoke.params.length !== 1) {
    return;
  }

  var value = invoke.params[0][1];

  if(value === "up") {
    notify(this, "buttonup", {device:this, button:invoke.method});
  }
  else if(value === "down") {
    notify(this, "buttondown", {device:this, button:invoke.method});
  }
};

cp.sendControlScheme = function() {
  for(var i = 0; i < controlSchemeChunks.length; ++i) {
    this.sendPacket({
      channel : CHANNEL_BYTE,
      message : controlSchemeChunks[i]
    });
  }
};

cp.sendInvoke = function(method, params) {
  this.sendPacket({channel:CHANNEL_MESSAGE, message:makeInvoke(method, params)});
};

cp.sendPacket = function(packet) {
  packet.sequence = ++this.sequence;
  packet.deviceId = localDevice.id;
  packet.deviceType = localDevice.type;
  packet.channel = packet.channel || CHANNEL_BROADCAST;
  packet.type = packet.type || PACKET_DATA;
  packet.rtt = 0;
  packet.timestamp = 0;
  //bm.log("WROTE PACKET: " + JSON.stringify(packet));
  var encodedPacket = encodePacket(packet);
  this.socket.send(JSON.stringify(encodedPacket));
};





/////////////////////////////////////////////////////////////////////
//   Serialization Stuff
/////////////////////////////////////////////////////////////////////
//   Serialization Stuff
function packVersion(version) {
  return ((version.major&0xFF)<<24) | ((version.minor&0xFF)<<16);
}

function unpackVersion(packed) {
  return {
    major: (packed >> 24)&0xFF,
    minor: (packed >> 16)&0xFF
  };
}

var INCLUDE_UNUSED_ENCODERS = false;



function decodeObject(encoded) {
  var decoder = decoders[encoded[0]];
  if(decoder) {
    return decoder(encoded);
  }

  throw new Error("no decoder for "+encoded);
}

function encodeObject(object) {
  var encoder = encoders[object.encodeType];
  if(encoder) {
    return encoder(object);
  }
  
  throw new Error("no encoder for "+object);
}

var decoders = [];
var encoders = [];

function decodePacket(encoded) {
  var packet = {};
  var i = 0;
  packet.channel = encoded[++i];
  packet.sequence = encoded[++i];
  packet.timestamp = encoded[++i];
  packet.rtt = encoded[++i];
  packet.type = encoded[++i];
  packet.deviceType = encoded[++i];
  packet.deviceId = encoded[++i];
  packet.deviceName = encoded[++i];
  if(encoded[++i]) {
    packet.message = decodeObject(encoded[++i]);
  }
  return packet;
}
decoders[ENCODE_PACKET] = decodePacket;

function encodePacket(packet) {
  return [ENCODE_PACKET, packet.channel, packet.sequence, 0, 0, packet.type, packet.deviceType, packet.deviceId, packet.deviceName, true, encodeObject(packet.message)];
}
encoders[ENCODE_PACKET] = encodePacket;

function decodeAddress(encoded) {
  return { hostname:encoded[1], udpPort:encoded[2], tcpPort:encoded[3] };
}
decoders[ENCODE_ADDRESS] = decodeAddress;

function encodeAddress(address) {
  return [ENCODE_ADDRESS, address.hostname, address.udpPort, address.tcpPort];
}
encoders[ENCODE_ADDRESS] = encodeAddress;

////
// Parameter
// (zfk) I am just going to represent this as an array for compactness
// I can get away with it since only Invokes use them
function decodeParameter(encoded) {
  var type = encoded[1];
  var value = encoded[2];
  if(type === '@') {
    value = decodeObject(value);
  }
  return [type, value];
}
decoders[ENCODE_PARAMETER] = decodeParameter;

function encodeParameter(param) {
  return [ENCODE_PARAMETER, param[0], (param[0] === '@' ? encodeObject(param[1]) : param[1])];
}
encoders[ENCODE_PARAMETER] = encodeParameter;

function decodeInvoke(encoded) {
  var i = 0;
  var params = [];
  var invoke = {};
  ++i; // invoke_id
  invoke.method = encoded[++i];
  invoke.returnMethod = encoded[++i];
  invoke.params = params;

  var paramCount = encoded[++i];
  var paramEnd = i + paramCount;
  while( i < paramEnd ) {
    params.push(decodeParameter(encoded[++i]));
  }

  return invoke;
}
decoders[ENCODE_INVOKE] = decodeInvoke;

function encodeInvoke(invoke) {
  var params = invoke.params;
  var encoded = [ENCODE_INVOKE, 0, invoke.method, invoke.returnMethod, params.length];
  var i;
  for(i = 0; i < params.length; ++i) {
    encoded.push(encodeParameter(params[i]));
  }
  return encoded;
}
encoders[ENCODE_INVOKE] = encodeInvoke;


function decodeAcceleration(encoded) {
  return {'x':encoded[1], 'y':encoded[2], 'z':encoded[3]};
}
decoders[ENCODE_ACCELERATION] = decodeAcceleration;

if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_ACCELERATION] = function(accel) {
    return [ENCODE_ACCELERATION, accel['x'], accel['y'], accel['z'] ];
  };
}

////////////
// Touch Set
////////////
decoders[ENCODE_TOUCH_SET] = function(encoded) {
  var i = 0;
  var touchCount = encoded[++i];
  var touches = [];
  var currentTouch;
  for(currentTouch = 0; currentTouch < touchCount; ++currentTouch) {
    var touch = {};
    touch['x'] = encoded[++i];
    touch['y'] = encoded[++i];
    touch['viewWidth'] = encoded[++i];
    touch['viewHeight'] = encoded[++i];
    touch['phase'] = encoded[++i];
    touch['id'] = encoded[++i];
    touches.push(touch);
  }

  return {touches:touches};
};

if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_TOUCH_SET] = function(touchSet) {
    var touches = touchSet.touches;
    var encoded = [ENCODE_TOUCH_SET, touches.length];
    var i;
    for(i = 0; i < touches.length; ++i) {
      var touch = touches[i];
      encoded.push(touch['x']);
      encoded.push(touch['y']);
      encoded.push(touch['viewWidth']);
      encoded.push(touch['viewHeight']);
      encoded.push(touch['phase']);
      encoded.push(touch['id']);
    }
    return encoded;
  };
}

//
// Devices
function decodeDevice(encoded) {
  return {encodeType:encoded[0], type:encoded[1], id:encoded[2], name:encoded[3]};
}
function encodeDevice(device) {
  return [device.encodeType, device.type, device.id, device.name];
}

var addDeviceEncoder = function(type) {
  decoders[type] = decodeDevice;
  encoders[type] = encodeDevice;
};

addDeviceEncoder(ENCODE_DEVICE_IPHONE);
addDeviceEncoder(ENCODE_DEVICE_UNITY);
addDeviceEncoder(ENCODE_DEVICE_ANDROID);
addDeviceEncoder(ENCODE_DEVICE_NATIVE);
addDeviceEncoder(ENCODE_DEVICE_PALM);
addDeviceEncoder(ENCODE_DEVICE_FLASH);

//
// Ack
decoders[ENCODE_ACK] = function(encoded) {
  return { device:decodeDevice(encoded[1]), address:decodeAddress(encoded[2]) };
};
encoders[ENCODE_ACK] = function(ack) {
  return [ENCODE_ACK, encodeDevice(ack.device), encodeAddress(ack.address)];
};

//
// Ping
decoders[ENCODE_PING] = function(encoded) {
  return {uid:encoded[1], address:decodeAddress(encoded[2])};
};
encoders[ENCODE_PING] = function(ping) {
  return [ENCODE_PING, ping.uid, encodeAddress(ping.address)];
};

//
// Shake
decoders[ENCODE_SHAKE] = function(/*encoded*/) {
  return {};
};
encoders[ENCODE_SHAKE] = function(/*shake*/) {
  return [ENCODE_SHAKE, 0];
};

// ByteChunk
decoders[ENCODE_BYTE_CHUNK] = function(encoded) {
  return {
    setId : encoded[1],
    startByte : encoded[2],
    chunkSize : encoded[3],
    totalSize : encoded[4],
    data : encoded[5]
  };
};
encoders[ENCODE_BYTE_CHUNK] = function(chunk) {
  return [ENCODE_BYTE_CHUNK, chunk.setId, chunk.startByte, chunk.chunkSize, chunk.totalSize, chunk.data];
};

// RegistryInfo
decoders[ENCODE_REGISTRY_INFO] = function(encoded) {
  var i = 0;
  var info = {};
  info.device = decodeDevice(encoded[++i]);
  info.address = decodeAddress(encoded[++i]);
  info.appId = encoded[++i];
  info.slotId = encoded[++i];
  if(info.slotId > 0) {
    info.currentPlayers = encoded[++i];
    info.maxPlayers = encoded[++i];
  }
  return info;
};
encoders[ENCODE_REGISTRY_INFO] = function(info) {
  var encoded = [
    ENCODE_REGISTRY_INFO,
    encodeDevice(info.device),
    encodeAddress(info.address),
    info.appId,
    info.slotId
  ];
  if(info.slotId > 0) {
    encoded.push(info.currentPlayers);
    encoded.push(info.maxPlayers);
  }
  return encoded;
};

// TaggedArray
// TODO

// Gyro
decoders[ENCODE_GYRO] = function(encoded) {
  return {'x':encoded[1], 'y':encoded[2], 'z':encoded[3]};
};
if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_GYRO] = function(gyro) {
    return [ENCODE_GYRO, gyro['x'], gyro['y'], gyro['z'] ];
  };
}

// Orientation
decoders[ENCODE_ORIENTATION] = function(encoded) {
  return {'x':encoded[1], 'y':encoded[2], 'z':encoded[3], 'w':encoded[4]};
};
if(INCLUDE_UNUSED_ENCODERS) {
  encoders[ENCODE_ORIENTATION] = function(q) {
    return [ENCODE_ORIENTATION, q['x'], q['y'], q['z'], q['w'] ];
  };
}

var controlSchemeChunks;
var generateByteChunks = function(xml) {
  var MAX_CHUNK_SIZE = 1024*32,
    chunks = [],
    xmlLength = xml.length,
    nextChar = 0,
    totalBytes = 0;

  for(nextChar = 0; nextChar < xmlLength; nextChar += MAX_CHUNK_SIZE) {
    var result = bm.Base64.encode(xml.substr(nextChar, MAX_CHUNK_SIZE)),
        chunkSize = result[0],
        encoded = result[1];

    chunks.push({
      encodeType : ENCODE_BYTE_CHUNK,
      setId: 'testXML',
      startByte: totalBytes,
      chunkSize: chunkSize,
      data: encoded
    });

    totalBytes += chunkSize;
  }

  for(var i = 0; i < chunks.length; ++i) {
    chunks[i].totalSize = totalBytes;
  }

  return chunks;
};



function createDebugControls(){
  // Create a DOM element to hold the elements of the controller layout
  var ui = document.createElement('div');
  document.body.insertBefore(ui,document.body.firstChild);
  
  ui.style.width = "273px";
  ui.style.height = "23px";
  ui.style.position = "absolute";
  ui.style.overflow = "hidden";
  ui.style.border = "thin solid grey";
  ui.style.backgroundColor = "white";
  
  // Create Start Button
  var startButton = document.createElement('input');
  startButton.setAttribute("type", "button");
  startButton.setAttribute("value", "Start");
  startButton.setAttribute("name", "start");
  
  startButton.onclick = function(){
    // Store IP address
    setCookie("ipaddress",ipAddress.value);
  
    // Load all of the controller images and then generate
    // the base64 encoded version of their data for sending
    // to the controller app devices as they connect.
    // TODO: Can we do work in parallel with this?
    bm.loadImages(bm.options.design.images,function(imageData){
      var xml = bm.generateControllerXML(imageData);
      controlSchemeChunks = generateByteChunks(xml);
      start(ipAddress.value);
    });
  };
  ui.appendChild(startButton);
  
  // Create input field for the device IP Address
  var ipAddress = document.createElement('input');
  
  ipAddress.style.width = "120px";
  ipAddress.setAttribute("type", "text");
  ipAddress.setAttribute("name", "");
  
  // Load the previously entered IP address
  var previousIP = getCookie("ipaddress");
  if(previousIP){
    ipAddress.setAttribute("value", previousIP);
  } else {
    ipAddress.setAttribute("value", "<ipaddress>");
  }
  ui.appendChild(ipAddress);
  
  function setCookie(c_name,value){
    var exdays = 365,
        exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays===null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  }
  
  function getCookie(c_name){
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++){
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x===c_name){
        return unescape(y);
      }
    }
  }
}

//
if(bm.detectRuntime()==="websockets"){
  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', createDebugControls, false);
  } else {
    window.attachEvent('onload', createDebugControls);
  }
}

bm.WebSocketsRT = bm.Class.extend({
  init:function(){
  },
  start: function(options){
    localDevice.id = options.deviceId;
    localDevice.name = options.name;
    bm.log(options.deviceId);
  },
  stop: function(){
    stop();
  }
});

})(BrassMonkey);