package
{
	import com.adobe.serialization.json.JSONDecoder;
	import com.adobe.serialization.json.JSONEncoder;
	import com.brassmonkey.BMApplication;
	import com.brassmonkey.BrassMonkey;
	import com.brassmonkey.SettingsManager;
	import com.brassmonkey.controls.BMControls;
	import com.brassmonkey.controls.writer.AppScheme;
	import com.brassmonkey.controls.writer.BMDynamicText;
	import com.brassmonkey.devices.Device;
	import com.brassmonkey.devices.messages.Touch;
	import com.brassmonkey.events.AccelerationEvent;
	import com.brassmonkey.events.DeviceEvent;
	import com.brassmonkey.events.InvokeEvent;
	import com.brassmonkey.events.ShakeEvent;
	import com.brassmonkey.events.TouchEvent;
	import com.brassmonkey.events.VersionPacketEvent;
	import com.brassmonkey.externals.BMRegistryInfo;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.system.Security;
	import flash.utils.clearInterval;
	import flash.utils.setTimeout;
	
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;
	
	[SWF(width="1", height="1")]
	
	[ResourceBundle("helper")]
	public class brassmonkey extends Sprite
	{
		
		
		private var resourceManager:IResourceManager =ResourceManager.getInstance();
		
		
		internal static var PARAM_CONTROLLER_XML:String="bmControllerXML"
		
			
		private var brassMonkey:BMApplication=new BMApplication(loaderInfo.parameters); 
		private var _canCall:Boolean=true;
		private var controlIndex:int=0;
		private var callBacks:Object={};
		private var privateResources:Array=[];
		private var privateResourceQue:Array=[];
		private var privateResourcesToLoad:int=0;
		private var resources:Array=[];
		private var resourceQue:Array=[];
		private var resourcesToLoad:int=0;
		private var isStarted:Boolean=false;
		
		private var interation:int = 0;
		private var error:Boolean=false;
		private var conn:Boolean=false;
		private var _updateTicker:uint=0;
		private var _clockTicker:uint=0;

		
		public static var install_device:String;
		public static var see_device:String;
		public static var try_device:String;
		public static var failed:String;
		public static var success:String;
		public var clients:Array=[];
		public function brassmonkey()
		{		
			install_device=(resourceManager.getString("helper","install_device"));
			see_device=(resourceManager.getString("helper","see_device"));
			try_device=(resourceManager.getString("helper","try_device"));
			failed=(resourceManager.getString("helper","failed"));
			success=(resourceManager.getString("helper","success"));
			
		
			
			Security.allowDomain("*");
			loaderInfo.addEventListener(Event.COMPLETE, onLoaded);
			
			trace(resourceManager.getLocales());
	
		}
		
		private function startHelper():void
		{
			if(_updateTicker!=0)
				return;
			doUpdate();
			this.interation=0;
			_updateTicker=flash.utils.setInterval(doUpdate, 10000);
			_clockTicker=flash.utils.setInterval(onTick, 1000);
		}
		
		private function shutDownHelper():void
		{
			flash.utils.clearInterval(_updateTicker);
			flash.utils.clearInterval(_clockTicker);
			_updateTicker=0;
			_clockTicker=0;
		}
		protected function onDevice(event:DeviceEvent):void
		{
			trace(event.type);
			switch(event.type)
			{
				case DeviceEvent.DEVICES_DISCOVERED:
					
					clients=[];
					
					for each (var device:BMRegistryInfo in event.devices)
					{
					
						if(device.slotId>0)
						{
							continue;
						}
					
						clients.push({deviceName:device.device.deviceName});
					}
					
					if(clients.length==0)
					{						
						ExternalInterface.call("bm.helper.onShowSlot",0);
						generateState(event.type,clients)
						
					}
					else
					{
						
						ExternalInterface.call("bm.helper.onShowSlot",brassMonkey.getInfo().slotId);
					}
					if(!conn && !error && clients.length > 0 && brassMonkey.session.registry.devices.length==0){
						//this.idInfo.text='If you see "Select Me" on your device, tap it with your finger.' ;
						printHelp(see_device );
						generateState(event.type,clients)
					
					}
					else if(!conn &&!error && brassMonkey.session.registry.devices.length==0){
						//this.idInfo.text='Start up the Brass Monkey application now. If it is currently running and you do not see it after the timer refreshes, your device is using a different gateway to reach the internet than this computer.' ;
						printHelp(install_device);
						generateState(event.type,clients)
					
					}
					
					
					//this.idDevices.dataProvider=new ArrayCollection(clients);
					break;
				
				case DeviceEvent.DEVICE_AVAILABLE:
					if( brassMonkey.session.registry.devices.length==0)
					{
						//idInfo.text='Okay, Lets see if we can connect your device over your local lan.' ;
						printHelp(try_device );
						conn=true;
						event.device.addEventListener(DeviceEvent.CAN_NOT_CONNECT, onDevice);						
					
						generateState(event.type,clients)
					}
					break;
				
				case DeviceEvent.CAN_NOT_CONNECT:
					trace("cant connect");
					conn=false;
					error=true;
					//this.idInfo.text='No! Unfortunalty, your LAN configuration is preventing the connection. Reconfigure your LAN and please try again.' ;
					printHelp(failed);
					generateState(event.type,clients)
					break;	
				
				case DeviceEvent.DEVICE_CONNECTED:
					event.device.removeEventListener(DeviceEvent.CAN_NOT_CONNECT, onDevice);
					conn=false;
					
					brassMonkey.session.setNavMode(event.device);
					
					printHelp(success);										
					//this.idInfo.text='Success! You are now ready to play games!' ;
					generateState(event.type,clients);
					ExternalInterface.call("bm.connectionSuccess",event.device.deviceId);
					break;
			}
			
		}
		
		private function onLoaded(event:Event):void
		{	
			brassMonkey.debugger=this;			
			
			
			brassMonkey.addEventListener(DeviceEvent.SLOT_DISPLAY_REQUEST, onSlot);
			brassMonkey.addEventListener(DeviceEvent.DEVICE_AVAILABLE,this.onDeviceDiscovery);
			brassMonkey.addEventListener(DeviceEvent.DEVICES_DISCOVERED, onDevice);
			brassMonkey.addEventListener(DeviceEvent.DEVICE_CONNECTED, onDevice);
			brassMonkey.addEventListener(DeviceEvent.DEVICE_LOADED,this.onDeviceConnected);
			brassMonkey.addEventListener(DeviceEvent.DEVICE_DISCONNECTED, this.onDeviceDisconnected);
			brassMonkey.addEventListener(DeviceEvent.NAVIGATION, onNavigationString);
			brassMonkey.addEventListener(InvokeEvent.INVOKE, onInvoke);
			brassMonkey.addEventListener(VersionPacketEvent.VERSION, onVersion);
			brassMonkey.addEventListener(TouchEvent.TOUCHES_RECEIVED,this.onTouchesReceived);
			brassMonkey.addEventListener(AccelerationEvent.ACCELERATION,this.onAccelReceived);

			brassMonkey.addEventListener(DeviceEvent.KEYBOARD,this.onKeyString);
			
			var appId:String = "a65971f24694b9c47a9bcd01";
			
			var nump:int = 96;
			
			if(loaderInfo.parameters['bmAppId'] && loaderInfo.parameters['bmAppId'].length)
			{  
				appId = loaderInfo.parameters['bmAppId'];
				
			}
			if(loaderInfo.parameters['bmMaxPlayers'])
			  nump = loaderInfo.parameters['bmMaxPlayers']
			
			brassMonkey.initiate("Brass Monkey",nump,appId);
			
			ExternalInterface.addCallback("startHelper", startHelper);
			
			ExternalInterface.addCallback("shutDownHelper", shutDownHelper);
			
			ExternalInterface.addCallback("setRegistryVersion", setRegistryVersion);
			ExternalInterface.addCallback("getRegistryVersion", getRegistryVersion);
			ExternalInterface.addCallback("getLanDevices", getLanDevices);
			ExternalInterface.addCallback("addResource", addResource);
			ExternalInterface.addCallback("loadResources", loadResources);
			ExternalInterface.addCallback("addDesign", addDesign);
			ExternalInterface.addCallback("start", start);
			ExternalInterface.addCallback("processDesign", processDesign);
			ExternalInterface.addCallback("setControlText", setControlText);
			ExternalInterface.addCallback("setControlpadPage", setControlpadPage);
			ExternalInterface.addCallback("measurePing", measurePing);
			
			if(loaderInfo.parameters.hasOwnProperty('bmControllerXML'))
			{	
				var controllerXML:String = decodeURIComponent(loaderInfo.parameters['bmControllerXML']);
				brassMonkey.session.registry.validateAndAddControlXML(controllerXML);
				start();
				
			}
			flash.utils.setTimeout(ExternalInterface.call,500,"bm.onFlashLoadedInternal");
	
		}
		
		public function setRegistryVersion(maj:int,min:int):void
		{
			SettingsManager.VERSION_MINIMUM.major=maj;
			SettingsManager.VERSION_MINIMUM.minor=min;
		}
		
		public function setControlText(deviceId:String,element:String, text:String, updateDevice:Boolean):void
		{
			var dev:Device = brassMonkey.session.registry.getDevice(deviceId);
			var schemes:Array=BMControls.appSchemes;
			var appScheme:AppScheme=BMControls.appSchemes[dev.controlSchemeIndex];
			
			if(!dev.attributes.hasOwnProperty('controlPage'))
			{
				dev.attributes.controlPage=1;
			}
			
			BMDynamicText(appScheme.getChildByName(element)).text=text;
			
			if(updateDevice)
				brassMonkey.session.updateControlScheme(dev,appScheme.pageToString(dev.attributes.controlPage));
			
		}
		public function measurePing(deviceId:String):void
		{
			var dev:Device = brassMonkey.session.registry.getDevice(deviceId);
			if(!dev)
				return;
	
			dev.sendPing();
			
		}
		public function setControlpadPage(deviceId:String, i:int):void
		{
			var dev:Device = brassMonkey.session.registry.getDevice(deviceId);
			
			var appScheme:AppScheme=BMControls.appSchemes[dev.controlSchemeIndex];
			dev.attributes.controlPage=i;
			brassMonkey.session.updateControlScheme(dev,appScheme.pageToString(i));
		}
		
		public function processDesign(json:String,calback:String):void
		{
			
			var sjodec:Object = new JSONDecoder(json).getValue();
			sjodec.callback=calback;
			var needsLookup:Boolean=false;
			
			for(var l:int=0;l<sjodec.resources.length;l++)
			{
				if(sjodec.resources[l].hasOwnProperty('uri'))
				{
					
					var pLq:LoaderQueue=new LoaderQueue(sjodec.resources[l].id,sjodec.resources[l].uri,0,0,false)
					pLq.parent=sjodec;
					pLq.element=sjodec.resources[l];
					privateResourceQue.push(pLq);
					
					needsLookup=true;
				}
			}
			
			if(!needsLookup)
			{
				parseJsonObject(sjodec);
			}
			else
			{
				loadPrivateResources(calback);
			}

		}
		
		private function parseJsonObject(sjodec:Object):void
		{
			var appScheme:AppScheme = BMControls.parseJsonObject(sjodec);
			
			brassMonkey.session.registry.validateAndAddControlXML(appScheme.toString());
			
			ExternalInterface.call(sjodec.callback);
		}
		
		public function addDesign(controls:Object):void
		{
			brassMonkey.session.registry.validateAndAddControlXML(controls.toString());
		}
		
		public function start():void{
			if(isStarted)
				return;
			
			isStarted=true;
			brassMonkey.start();
			
			ExternalInterface.addCallback("SetVisibility", SetVisibility);
			ExternalInterface.addCallback("SetControlScheme", SetControlScheme);
			ExternalInterface.addCallback("VibrateDevice", VibrateDevice);
			ExternalInterface.addCallback("SetNavMode", SetNavMode);
			ExternalInterface.addCallback("SetKeyboardMode", SetKeyboardMode);
			ExternalInterface.addCallback("SetGamepadMode", SetGamepadMode);
			ExternalInterface.addCallback("GetDevices", GetDevices);
			ExternalInterface.addCallback("SetWaitForNewHost", SetWaitForNewHost)
			
			ExternalInterface.addCallback("EnableAccelerometer", EnableAccelerometer);		
			ExternalInterface.addCallback("EnableTouch", EnableTouch);	
			ExternalInterface.addCallback("setDeviceAttribute", setDeviceAttribute);	
			ExternalInterface.addCallback("getDeviceAttributes", getDeviceAttributes);	
			ExternalInterface.addCallback("setCookie", setCookie);	
			ExternalInterface.addCallback("getCookie", getCookie);
			
			ExternalInterface.addCallback("setCallback", setCallback);	
			ExternalInterface.addCallback("getDevice", getDevice);	
			ExternalInterface.addCallback("setWaitMode", setWaitMode);	
			

		
			ExternalInterface.addCallback("updateControlPad", updateControlPad);			
			ExternalInterface.addCallback("closeDevice", closeDevice);

			
		}
		

		
		public function loadPrivateResources(callback:String):void
		{
			
			privateResourcesToLoad=privateResourceQue.length;
			while(privateResourceQue.length)
			{
				var lq:LoaderQueue=privateResourceQue.shift();
				lq.addEventListener(Event.COMPLETE, privateResourcesLoaded);
				
				lq.load();
				
			}
			
			
		}
		private function privateResourcesLoaded(e:Event):void
		{
			
			var lq:LoaderQueue=e.target as LoaderQueue;
			lq.element.data=lq.base64;

			
			if(--privateResourcesToLoad == 0)
			{
				parseJsonObject(lq.parent);
			}
		}
		public function addResource(pName:String, uri:String,width:Number,height:Number,scaleSource:Boolean):void
		{
			resourceQue.push(new LoaderQueue(pName,uri,width,height,scaleSource));
		}
		
		public function loadResources(callback:String):void
		{
			callBacks['loadResources']=callback;
			resourcesToLoad=resourceQue.length;
			while(resourceQue.length)
			{
				var lq:LoaderQueue=resourceQue.shift();
				lq.addEventListener(Event.COMPLETE, resourcesLoaded);
				
				lq.load();
				
			}
			
			
		}
		private function resourcesLoaded(e:Event):void
		{
			
			var lq:LoaderQueue=e.target as LoaderQueue;
			resources.push({
				name:lq.name,
				data:lq.base64
			});
			lq.loader.unload();
			if(--resourcesToLoad == 0)
			{
				ExternalInterface.call(callBacks['loadResources'],resources);
			}
		}
		public function closeDevice(devId:String):void
		{
			var dev:Device=this.brassMonkey.session.registry.getDevice(devId);
			if(dev)
			{
				dev.outPipe.disconnect();
			}
		}
		
		public function getRegistryVersion():String
		{
			return BrassMonkey.Version;
		}
		
		public function updateControlPad(guid:String, xml:String,callBack:String):void
		{
			var dev:Device=this.brassMonkey.session.registry.getDevice(guid);
			if(dev)
			{
				brassMonkey.session.updateControlScheme(dev,xml);
			}
		}
		
		public function getLanDevices(callBack:String):void
		{
			if(!_canCall)
				return;
			_canCall=false;
			
			flash.utils.setTimeout(resetCall,4000);
			
			callBacks['getLanDevices']=callBack;
			
			brassMonkey.addEventListener(DeviceEvent.DEVICES_DISCOVERED, onDevicesDiscovered);
			brassMonkey.session.registry.discoveryService.getList();
		}
		private function resetCall():void
		{
			_canCall=true;
		}
		public function onDevicesDiscovered(event:DeviceEvent):void
		{
			brassMonkey.removeEventListener(DeviceEvent.DEVICES_DISCOVERED, onDevicesDiscovered);
			var call:String=callBacks['getLanDevices'];
			var ret:Array=[];
			for each(var regi:BMRegistryInfo in event.devices)
			{
				if(!regi.isHost)
				{
					ret.push({name:regi.device.deviceName});
				}
			}
			
			ExternalInterface.call(call,ret);
			
		}
		public function setWaitMode(guid:String):void
		{
			
			brassMonkey.session.refreshDeviceList();
			
			var dev:Device=this.brassMonkey.session.registry.getDevice(guid);
			if(dev)
			{
				brassMonkey.session.setWaitMode(dev);
			}
		}
		
		private function serializeDevice(dev:Device):Object
		{ 
			var ser:Object={
				buttons:brassMonkey.clientButtonStates[dev.deviceId],
					deviceId:dev.deviceId,
					deviceName:dev.deviceName,
					controlSchemeIndex:dev.controlSchemeIndex,
					controlMode:dev.controlMode,
					textContent:dev.textContent,
					attributes:dev.attributes
			};
			
			
			return ser;
		}
		
		public function getDevice(guid:String):Object
		{   
			
			
			var dev:Device=this.brassMonkey.session.registry.getDevice(guid);
			if(dev)
			{
				var ser:Object={
					buttons:brassMonkey.clientButtonStates[guid],
						deviceId:dev.deviceId,
						deviceName:dev.deviceName,
						controlSchemeIndex:dev.controlSchemeIndex,
						controlMode:dev.controlMode,
						textContent:dev.textContent,
						attributes:dev.attributes
				};
				
				
				return ser;
			}
			return null;
		}
		
		public function setCallback(devId:String,name:String,val:String):void
		{
			trace('setCallback',devId,name,val);
			
			if(name==DeviceEvent.TEXT_ENTER || name==DeviceEvent.PAUSE || name==DeviceEvent.SCHEME_BUTTON )
			{
				var dev:Device=this.brassMonkey.session.registry.getDevice(devId);
				if(dev)
				{	
					callBacks[devId][name]=val;
					dev.addEventListener(name, onCallBack);
				}
			}
			if(name==DeviceEvent.NAVIGATION || name==DeviceEvent.KEYBOARD )
			{

				
				brassMonkey.addEventListener(name, onCallBack);		
				callBacks[devId][name]=val;
						
			}
		}

		private function onCallBack(e:DeviceEvent):void
		{
			var dev:Device = e.device;
			var func:String = callBacks[dev.deviceId][e.type];
			
			var de:DeviceEvent=e as DeviceEvent;
			
			
			var ser:Object={event:e.type,
					value:e.value,
					buttons:brassMonkey.clientButtonStates[dev.deviceId],
					controlSchemeIndex:dev.controlSchemeIndex,
					deviceId:de.device.deviceId,
					controlMode:dev.controlMode,
					deviceName:de.device.deviceName,
					textContent:de.device.textContent,
					attributes:de.device.attributes
			};
			for(var prop:String in ser.buttons)
			{
				if(prop=="")
				{
					delete ser.buttons[prop];
					
				}
			}
			
			ExternalInterface.call(func,ser);
		}
		

		
		public function setCookie(devId:String,name:String,val:String):void
		{
			var dev:Device=this.brassMonkey.session.registry.getDevice(devId);
			if(dev)
			{
				brassMonkey.session.setCookie(dev,name,val);
			}
		}
		
		public function getCookie(devId:String,name:String,callBack:String):void
		{
			trace('getCookie',devId);
			var dev:Device=this.brassMonkey.session.registry.getDevice(devId);
			if(dev)
			{ 
				trace('got device',devId);
				callBacks[dev.deviceId]['onCookie']=callBack
				dev.attributes.onCookie=callBack;
				if(!dev.willTrigger(DeviceEvent.GOT_COOKIE))
				dev.addEventListener(DeviceEvent.GOT_COOKIE, onCookie);
				
				brassMonkey.session.getCookie(dev,name);
			}
			
		}
		
		private function onCookie(event:DeviceEvent):void
		{
			var callBack:String =callBacks[event.device.deviceId]['onCookie'];
			ExternalInterface.call(callBack,  event.device.attributes);
		}
		public function setDeviceAttribute(devId:String,name:String,val:*):void
		{
			var dev:Device=this.brassMonkey.session.registry.getDevice(devId);
			if(dev)
			{
				dev.attributes[name]=val;
			}
		}
		
		public function getDeviceAttributes(devId:String):Object
		{
			trace('getDeviceAttributes',devId);
			var dev:Device=this.brassMonkey.session.registry.getDevice(devId);
			if(dev)
			{
				
				return dev.attributes;
			}
			return null;
		}
		public function onSlot(de:DeviceEvent):void
		{
			trace("onSlot");
			ExternalInterface.call("bm.showSlotInternal",brassMonkey.session.getSlotDisplay().slot);
			
			printHelp(install_device );

			startHelper();
		}
		protected function SetVisibility(isVisible:Boolean, doNotify:Boolean):void
		{
			brassMonkey.session.registry.discoveryService.setVisibility(isVisible,doNotify);
		}
		
		protected function onVersion(evt:VersionPacketEvent):void
		{
			trace(evt.packet.packetStream.address,evt.packet);
		}
		
		public function logMessage(messageString:String):void
		{			
			trace("logMessage "+messageString  );
			ExternalInterface.call("bm.log",messageString);
		}		
		protected function onInvoke(evt:InvokeEvent):void
		{
			ExternalInterface.call("bm.onInvocationInternal",evt.invoke,evt.deviceId);
		}
		
		protected function SetWaitForNewHost(deviceId:String, devices:Array=null):void
		{
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++)
			{
				if(devices && devices.indexOf(brassMonkey.session.registry.devices[t].deviceId)>-1)
				{
					brassMonkey.session.setWaitForHost(brassMonkey.session.registry.devices[t],deviceId);
				}
				else if(!devices )
				{
					brassMonkey.session.setWaitForHost(brassMonkey.session.registry.devices[t],deviceId);
				}
			}	
		}
		
		protected function EnableAccelerometer(deviceId:String,enabled:Boolean,intervalSeconds:Number ):void {
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++){
				if(brassMonkey.session.registry.devices[t].deviceId==deviceId){
					brassMonkey.session.enableAccelerometer(brassMonkey.session.registry.devices[t],enabled,intervalSeconds);
				}
			}
		}
		
		protected function EnableTouch(deviceId:String,enabled:Boolean,intervalSeconds:Number ):void {
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++){
				if(brassMonkey.session.registry.devices[t].deviceId==deviceId){
					brassMonkey.session.enableTouch(brassMonkey.session.registry.devices[t],enabled);
					brassMonkey.session.setTouchInterval(brassMonkey.session.registry.devices[t],intervalSeconds);
				}
			}
		}
		
		protected function GetDevices():Array
		{	
			var results:Array=[];
			
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++)
			{
				results.push({deviceId:brassMonkey.session.registry.devices[t].deviceId,
					deviceName:brassMonkey.session.registry.devices[t].deviceName})
			}			
			
			return results;
		}
		
		protected function VibrateDevice(deviceId:String=null):void
		{
			if(deviceId)
			{
				var vd:Device= brassMonkey.session.registry.getDevice(deviceId);
				if(vd)
					brassMonkey.session.vibrateDevice( vd);
				
				return;
			}
			
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++)
			{
				brassMonkey.session.vibrateDevice(brassMonkey.session.registry.devices[t]);
			}
			
		}
		
		protected function SetControlScheme(str:String):void
		{			
			trace("got setControlScheme from host");
			
			controlIndex++;
			brassMonkey.session.registry.validateAndAddControlXML(str);
		}
		
		private function onDeviceDisconnected(evt:DeviceEvent):void{
			
			
			var dev:Object={deviceId:evt.device.deviceId,deviceName:evt.device.deviceName};
			ExternalInterface.call("bm.onDeviceDisconnectedInternal", dev);
			
			if(this.brassMonkey.session.registry.devices.length==0){
				startHelper();
			}
			
		} 
		
		
		private function onDeviceDiscovery(evt:DeviceEvent):void 
		{
			evt.device.controlSchemeIndex=controlIndex;

			if( brassMonkey.session.registry.devices.length==0)
			{
				//idInfo.text='Okay, Lets see if we can connect your device over your local lan.' ;
				printHelp(try_device );
				conn=true;
				evt.device.addEventListener(DeviceEvent.CAN_NOT_CONNECT, onDevice);						
				
				generateState(evt.type,clients)
			}
			
			
			evt.device.controlMode=Device.MODE_NAVIGATION;
			var ser:Object={				
					deviceId:evt.device.deviceId,
					deviceName:evt.device.deviceName,
					controlSchemeIndex:evt.device.controlSchemeIndex,
					controlMode:evt.device.controlMode,
					attributes:evt.device.attributes
			};
			
			var results:Object= ExternalInterface.call("bm.onDeviceAvailableInternal", ser);
			
			if(results )
			{
					trace(results);
					evt.device.controlMode=results.controlMode;
					evt.device.controlSchemeIndex=results.controlSchemeIndex;
					
					for(var prop:String in results.attributes){
						evt.device.attributes[prop]=results.attributes[prop];
					}
			}
			
			
			
			
			this.brassMonkey.session.connectDevice(evt.device);	
		}
		
		public function SetNavMode(deviceId:String=""):void
		{
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++)
			{
				if(brassMonkey.session.registry.devices[t].deviceId==deviceId||deviceId==""){
					brassMonkey.session.setNavMode(brassMonkey.session.registry.devices[t]);
				}
			}
		}
		
		public function SetGamepadMode(deviceId:String=""):void
		{
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++)
			{
				if(brassMonkey.session.registry.devices[t].deviceId==deviceId||deviceId==""){
					brassMonkey.session.setGamepadMode(brassMonkey.session.registry.devices[t]);
				}
			}
		}
		
		public function SetKeyboardMode(deviceId:String="",strInput:String=""):void
		{
			trace("got keyboard mode");
			
			for(var t:int=0;t<brassMonkey.session.registry.devices.length;t++)
			{
				if(brassMonkey.session.registry.devices[t].deviceId==deviceId||deviceId==""){
					brassMonkey.session.setKeyboardMode(brassMonkey.session.registry.devices[t],strInput);
				}
			}	
			
		}
		
		public function onKeyString(event:DeviceEvent):void
		{			
			ExternalInterface.call("bm.onKeyStringInternal", event.device.deviceId,event.value);
		}
		
		public function onNavigationString(event:DeviceEvent):void
		{					
			ExternalInterface.call("bm.onNavigationStringInternal", event.device.deviceId,event.value);
		}
		
		private function onDeviceConnected(evt:DeviceEvent):void 
		{			
			evt.device.addEventListener(DeviceEvent.ECHO, onEcho);
			var dev:Object={deviceId:evt.device.deviceId,deviceName:evt.device.deviceName};
			callBacks[evt.device.deviceId]={};
			brassMonkey.session.setNavMode(evt.device);
			ExternalInterface.call("bm.onDeviceConnectedInternal", dev);
			
		}
		
		private function onEcho(event:DeviceEvent):void
		{
			trace("\tEcho time: ",event.device.attributes.echo_time );
			ExternalInterface.call("bm.onDeviceEchoInternal",event.device.attributes.echo_time,serializeDevice(event.device));
		}
		
		private function onShakeReceived(evt:ShakeEvent):void
		{		
			trace("GOT SHAKE");
			ExternalInterface.call("bm.onShakeReceivedInternal", evt);
		}
		
		private function onAccelReceived(evt:AccelerationEvent):void
		{
			
			var obj:Object = new Object();			
			obj.acceleration = evt.acceleration;	
			obj.deviceId = evt.deviceId;			
			ExternalInterface.call("bm.onAccelReceivedInternal", obj);
		}
		
		private function onTouchesReceived(evt:TouchEvent):void 
		{
			var obj:Object = new Object();
			obj.deviceId = evt.deviceId;
			var ar:Array = new Array();
			for(var i:int = 0;i<evt.touches.touches.length;i++)
			{
				
				var t:Object = new Object();
				var touch:Touch = evt.touches.touches[i];
				t.x = touch.x;
				t.y = touch.y;				
				t.id = touch.id;
				t.phase = touch.phase;
				trace(t.phase, "touch phase received", t.x, t.y);
				ar.push(t);
			}
			obj.touches = ar;			
			
			ExternalInterface.call("bm.onTouchesReceivedInternal", obj);
			
		}
		
		private function onTick():void
		{
			interation ++;
			interation>10?10:interation;
			ExternalInterface.call("bm.helper.helperTick",(10 - interation).toString());	
		}
		
		private function printHelp(msg:String):void
		{
			ExternalInterface.call("bm.helper.printHelp",msg);
		}
		
		private function doUpdate():void
		{
			interation=0;
			brassMonkey.session.registry.discoveryService.getList();
		}
		
		private function generateState(type:String, localDevices:Array):void
		{
			var ret:Object={ type:type,devices:localDevices};
			ret.registry={devices:[]};
			var dd:*=brassMonkey.session.registry.devices;
			
			for each(var dev:Device in brassMonkey.session.registry.devices){
			
					ret.registry.devices.push({deviceName:dev.deviceName})
			}
					
			ExternalInterface.call("bm.helper.setState", new JSONEncoder(ret).getString());
		}
		
		
		
	}
}