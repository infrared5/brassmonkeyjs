




	BMInvoke=function (method,returnMethod,data){
		this.methodName=method;
		this.returnMethod=returnMethod;
		this.data=data;
	};
	
	BMAddress = function(host, port) {
		this.host = host;
		this.reliablePort = port;
		this.unreliablePort = port;
		
	};
	BMDevice = function(deviceId, deviceName) {
		this.deviceId = deviceId;
		this.deviceName = deviceName;
		this.deviceType = "WEBSOCKET";
		this.encodeType = 18;	
	};
	
	BMInfo = function(appId, device, address, slot, max, current) {
		this.appId = appId;
		this.device = device;
		this.address = address;
		this.slotId = slot;
		this.maxPlayers = max;
		this.currentPlayers = current;
		
	};


/**
 * This class encapsulates the Device discovery service.
 * @class bm.discovery.RegistryConnection 
 * @extends bm.EventEmitter
 */
RegistryConnection =function() {
	
	RegistryConnection.prototype.init=function(info){			
		RegistryConnection.prototype.uri = "";
		RegistryConnection.prototype.websocket = null;
		RegistryConnection.prototype.clientInfo=info;		

		
	};
	
	RegistryConnection.prototype.connect = function( uri) {
		console.log(uri);
		RegistryConnection.prototype.uri = uri;
		RegistryConnection.prototype.websocket = new WebSocket(uri);
		RegistryConnection.prototype.websocket.onopen = this.onOpen;
		RegistryConnection.prototype.websocket.onclose = this.onClose;
		RegistryConnection.prototype.websocket.onmessage =this.onMessage;
		RegistryConnection.prototype.websocket.onerror = this.onError;
	};
	
	RegistryConnection.prototype.onOpen = function(event){
		//event.open
		
		var invoke = new BMInvoke("registry.register", "onRegister" , [RegistryConnection.prototype.clientInfo]);
			
		invoke.ws=32;
		var payload=JSON.stringify(invoke);	
		
		RegistryConnection.prototype.websocket.send(payload);
		console.log("sent register request "+payload);
	};
	
	RegistryConnection.prototype.onClose = function(event){
		//event.close
	};
	
	RegistryConnection.prototype.onError = function(event){
		//event.error
	};
	
	RegistryConnection.prototype.onMessage = function(event){
		console.log(event.data);
		//event.message
		var myObject = JSON.parse(event.data);
		var tType=0;

		switch (myObject.ws) {

		case 32://invoke
			var i = myObject.data.length;
			var j = 0;
			var parameters = [];
							
			while (j < i) {
				t = myObject.data[j++].value;				
				parameters.push(t);
			};
			
			fn = RegistryConnection.prototype[myObject.methodName];
			if(typeof fn === 'function') {				
			    fn.apply(RegistryConnection.prototype, parameters);
			}else{
				console.log('RegistryConnection function not found');
			}

			break;

		case 35://ping			
			break;
		}
		
		
		
	};
	
	RegistryConnection.prototype.onRegister = function(result) {
		if(!result){//failed, dispatch now. success, dispatch at onHostConnected
			
		}
	};
	
	RegistryConnection.prototype.onHostConnected = function(hostInfo) {
		
		if(hostInfo.device.deviceId == RegistryConnection.prototype.clientInfo.device.deviceId){
			this.clientInfo = hostInfo;		
			console.log("Woo Im connected ")
		}else{
			
		}
	};
	
	RegistryConnection.prototype.deviceConnectRequested = function(clientInfo){
		console.log("Device wants to connect! "+clientInfo.address.host)
		bm.jumpstart(clientInfo.address.host);
	};
	
}

