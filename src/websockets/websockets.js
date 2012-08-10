/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, sub:true, maxerr:50 */
/*global WebSocket:false, console:false */
(function(context) {
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

var removeConnection = function(deviceId) {
	var i;
	for(i = 0; i < connections.length; ++i) {
		if(connections[i].deviceId === deviceId) {
			connections.splice(i, 1);
			// TODO notify
			break;
		}
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

var start = function() {
	console.log("start");
	connections.push( new Connection("deviceId", "monkeys-ipod.local.", 9011));
};

var stop = function() {
	var i;
	for(i = 0; i < connections.length; ++i) {
		connections[i].close();
	}
	connections.length = 0;
	console.log("stop");
};

var Connection = function(deviceId, host, port) {
	this.deviceId = deviceId;
	this.socket = new WebSocket("ws://" + host + ":" + port);
	this.sequence = 0;

	var self = this;
	this.socket.onerror = function(/*error*/) {
		removeConnection(self.deviceId);
		console.log("error");
	};
	this.socket.onclose = function(/*closeEvent*/) {
		removeConnection(self.deviceId);
		console.log("DISCONNECTED");
	};
	this.socket.onmessage = bind(this.onVersion, this);
	this.socket.onopen = function() {
		var handshake = [packedVersion, packedVersion];
		self.socket.send(JSON.stringify(handshake));
		console.log("CONNECTED");
	};
};

Connection.prototype.onVersion = function(message) {
	var json = JSON.parse(message.data);
	console.log("GOT VERSION");

	// TODO: verify version
	this.sendPacket({
		type : PACKET_ACK,
		message : {
			encodeType: ENCODE_ACK,
			device: localDevice,
			address: localAddress
		}
	});

	this.sendInvoke("setReliabilityForTouch", [['i', 1], ['i', 1]]);

	this.socket.onmessage = bind(this.onMessage, this);
};

Connection.prototype.onMessage = function(message) {
	var json = JSON.parse(message.data);
	var packet = decodePacket(json);

	console.log("GOT MESSAGE: " + JSON.stringify(packet));

	if(CHANNEL_MESSAGE === packet.channel) {
		this.handleInvoke(packet.message);
	}
};

Connection.prototype.close = function() {
	this.socket.close();
};

Connection.prototype.handleInvoke = function(invoke) {
	switch(invoke.method) {
		case "RequestXML":
		this.sendControlScheme();
		break;

		case "OTHER":
		default:
			// TODO
		}
	};

	Connection.prototype.sendControlScheme = function() {
	// TODO: real control scheme, and base64
	this.sendPacket({
		channel : CHANNEL_BYTE,
		message : {
			encodeType : ENCODE_BYTE_CHUNK,
			setId: 'testXML',
			startByte: 0,
			chunkSize: 184,
			totalSize: 184,
			data: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KQk1BcHBsaWNhdGlvblNjaGVtZSB2ZXJzaW9uPSIwLjEiIG9yaWVudGF0aW9uPSJwb3J0cmFpdCIgdG91Y2hFbmFibGVkPSJubyIgYWNjZWxlcm9tZXRlckVuYWJsZWQ9Im5vIj4KPFJlc291cmNlcy8+PExheW91dC8+PC9CTUFwcGxpY2F0aW9uU2NoZW1lPg==' 
		}
	});
};

Connection.prototype.sendInvoke = function(method, params) {
	this.sendPacket({channel:CHANNEL_MESSAGE, message:makeInvoke(method, params)});
};

Connection.prototype.sendPacket = function(packet) {
	packet.sequence = ++this.sequence;
	packet.deviceId = localDevice.id;
	packet.deviceType = localDevice.type;
	packet.channel = packet.channel || CHANNEL_BROADCAST;
	packet.type = packet.type || PACKET_DATA;
	packet.rtt = 0;
	packet.timestamp = 0;
	console.log("WROTE PACKET: " + JSON.stringify(packet));
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

	throw "no decoder for "+encoded;
}

function encodeObject(object) {
	var encoder = encoders[object.encodeType];
	if(encoder) {
		return encoder(object);
	}
	
	throw "no encoder for "+object;
}

var decoders = {};
var encoders = {};

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
// TODO: Base64
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


context['bm'] = context['bm'] || {};
context['bm']['decodeObject'] = decodeObject;
context['bm']['encodeObject'] = encodeObject;
context['bm']['start'] = start;
context['bm']['stop'] = stop;

})(this);