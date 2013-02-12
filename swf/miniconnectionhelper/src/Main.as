package
{
	import flash.display.DisplayObject;
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.geom.ColorTransform;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;
	
	
	[SWF(width="451" ,height="275")]
	
	
	public class Main extends Sprite
	{
		public var helper:Connector;
		
		protected var _stg:Stage;
		
		protected var tip:MovieClip;
		
		public function Main()
		{
			helper=new Connector();
			helper.x = 287;
			addChild(helper);
			helper.nodeviceBtn.visible = false;
			helper.phone.visible = false;
			helper._timer.visible = true;			
			helper.nodeviceBtn.visible = false;
			helper.needAppBtn.visible = false;
			helper.needWifiBtn.visible = false;
			helper.popup.visible = false;
			helper.success_screen.visible = false;
			
			helper.download_ios.addEventListener(MouseEvent.MOUSE_UP, onGetIos);
			helper.download_android.addEventListener(MouseEvent.MOUSE_UP,onGetAndroid);
			helper.nodeviceBtn.addEventListener(MouseEvent.MOUSE_UP,onGetAdditionalHelp);
			helper.helpBtn.addEventListener(MouseEvent.MOUSE_UP,onGetHelp);
			//https://itunes.apple.com/us/app/brass-monkey/id455013514
			
			helper.needAppBtn.addEventListener( MouseEvent.MOUSE_UP, onNeedApp, false, 0, true );
			helper.needWifiBtn.addEventListener( MouseEvent.MOUSE_UP, onNeedWifi, false, 0, true );
			
			ExternalInterface.addCallback("onDeviceConnected",onDeviceConnected);
			ExternalInterface.addCallback("onDeviceDisconnected",onDeviceDisconnected);
			
			addEventListener( Event.ADDED_TO_STAGE, onAddedToStage, false, 0, true );
		}
		
		protected function onAddedToStage( e:Event ):void
		{
			stg = this.parent as Stage;
			addEventListener( Event.ENTER_FRAME, onEnterFrame, false, 0, true );
		}
		
		protected function onEnterFrame( e:Event ):void
		{
			if ( stg.getChildByName( 'channeltip' ) )
			{
				stg.getChildByName( 'channeltip' ).visible = helper.phone.visible;
			}
		}
		
		protected function onGetIos(event:MouseEvent):void
		{
			flash.net.navigateToURL(new URLRequest("https://itunes.apple.com/us/app/brass-monkey/id455013514"),"_getbrassmonkey");
			
		}
		protected function onGetAndroid(event:MouseEvent):void 
		{
			flash.net.navigateToURL(new URLRequest("https://play.google.com/store/apps/details?id=com.brassmonkey.controller"),"_getbrassmonkey");
			
		}
		
		protected function primePopup( frame:int ):void
		{
			helper.popup.gotoAndStop( frame );
			
			helper.popup.closeBtn.buttonMode = true;
			helper.popup.closeBtn.addEventListener( MouseEvent.MOUSE_UP, onClosePopup, false, 0, true );
			
			switch ( frame )
			{
				case 1:
					helper.popup.appleLrg.buttonMode = true;
					helper.popup.appleLrg.addEventListener( MouseEvent.MOUSE_UP, onHelpIOS, false, 0, true );
					
					helper.popup.androidLrg.buttonMode = true;
					helper.popup.androidLrg.addEventListener( MouseEvent.MOUSE_UP, onHelpAndroid, false, 0, true );
					break;
				case 2:
				case 3:
					helper.popup.alrightBtn.buttonMode = true;
					helper.popup.alrightBtn.addEventListener( MouseEvent.MOUSE_UP, onClosePopup, false, 0, true );
					break;
				case 4:
					helper.popup.supportBtn.buttonMode = true;
					helper.popup.supportBtn.addEventListener( MouseEvent.MOUSE_UP, onGetSupport, false, 0, true );
			}
		}
		
		protected function onGetAdditionalHelp(event:MouseEvent):void
		{
			helper.popup.visible = true;
			primePopup( 4 );
		}
		
		protected function onGetHelp(event:MouseEvent):void
		{
			helper.popup.visible = true;
			primePopup( 1 );
		}
		
		protected function onHelpIOS( e:MouseEvent ):void
		{
			helper.popup.visible = true;
			primePopup( 2 );
		}
		
		protected function onHelpAndroid( e:MouseEvent ):void
		{
			helper.popup.visible = true;
			primePopup( 3 );
		}
		
		protected function onClosePopup( e:MouseEvent ):void
		{
			helper.popup.gotoAndStop( 1 );
			helper.popup.visible = false;
			helper.phone.visible = false;
			
			helper.helpBtn.visible = true;
			helper.quotes.visible = true;
			helper.download_ios.visible = true;
			helper.download_android.visible = true;
		}
		
		protected function onNeedApp( e:MouseEvent ):void
		{
			helper.phone.visible = false;
			
			helper.helpBtn.visible = true;
			helper.quotes.visible = true;
			helper.download_ios.visible = true;
			helper.download_android.visible = true;
		}
		
		protected function onNeedWifi( e:MouseEvent ):void
		{
			helper.popup.visible = true;
			primePopup( 1 );
		}
		
		protected function onGetSupport( e:MouseEvent ):void
		{
			helper.popup.gotoAndStop( 1 );
			helper.popup.visible = false;
			helper.phone.visible = false;
			
			helper.helpBtn.visible = true;
			helper.quotes.visible = true;
			helper.download_ios.visible = true;
			helper.download_android.visible = true;
			
			flash.net.navigateToURL( new URLRequest( 'http://playbrassmonkey.com/support' ) );
		}
		
		public function onResize(event:Event):void
		{
			if ( !tip )
			{
				var n:int = _stg.numChildren - 1;
				var chd:DisplayObject;
				while ( n > -1 )
				{
					chd = _stg.getChildAt( n );
					if ( chd.name == 'channeltip' )
					{
						tip = chd as MovieClip;
						break;
					}
					n--;
				}
			}
			
			if ( tip )
			{
				tip.y = 0;
				tip.x = 512 + ((_stg.stageWidth * 0.5) - tip.width);
			}
		}
		
		public function onDeviceConnected():void
		{
			helper.success_screen.visible = true;
			helper.addChild( helper.success_screen );
			onClosePopup( null );
		}
		
		public function onDeviceDisconnected():void
		{
			helper.success_screen.visible = false;
		}
		
		public function get stg():Stage
		{
			return _stg;
		}
		
		public function set stg(value:Stage):void
		{
			_stg = value;
			_stg.scaleMode = StageScaleMode.NO_SCALE;
			_stg.align = StageAlign.TOP;
			
			_stg.addEventListener(Event.RESIZE, onResize);
		}
		
	}
}