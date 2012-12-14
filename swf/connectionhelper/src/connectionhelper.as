package
{
	import flash.display.Graphics;
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;


	[SWF(width="1024" ,height="768")]
	

	public class connectionhelper extends Sprite
	{
		public var helper:Connector;

		public function connectionhelper()
		{
		
			stage.addEventListener(Event.RESIZE, onResize);
			
			helper=new Connector();
			helper.nodeviceBtn.visible = false;
			helper.phone.visible = false;
			helper._deviceList.visible = false;
			helper._timer.visible = true;			
			helper.nodeviceBtn.visible = false;
			helper.download_ios.addEventListener(MouseEvent.MOUSE_UP, onGetIos);
			helper.download_android.addEventListener(MouseEvent.MOUSE_UP,onGetAndroid);
			helper.nodeviceBtn.addEventListener(MouseEvent.MOUSE_UP,onGetHelp);
			helper.helpBtn.addEventListener(MouseEvent.MOUSE_UP,onGetHelp);
			//https://itunes.apple.com/us/app/brass-monkey/id455013514
			
			ExternalInterface.addCallback("onTick",onTick);
			ExternalInterface.addCallback("setState",setState);
			ExternalInterface.addCallback("setSlot",setSlot);
			ExternalInterface.addCallback("printHelp",printHelp);
			addChild(helper);
		}
		
		protected function onGetIos(event:MouseEvent):void
		{
			flash.net.navigateToURL(new URLRequest("https://itunes.apple.com/us/app/brass-monkey/id455013514"),"_getbrassmonkey");
			
		}
		protected function onGetAndroid(event:MouseEvent):void 
		{
			flash.net.navigateToURL(new URLRequest("https://play.google.com/store/apps/details?id=com.brassmonkey.controller"),"_getbrassmonkey");
			
		}
		protected function onGetHelp(event:MouseEvent):void
		{
			flash.net.navigateToURL(new URLRequest("http://playbrassmonkey.com/support"),"_helpme");
			
		}
		protected function onResize(event:Event):void
		{
		
			
		}
		
		public function printHelp( val:String):void
		{
			helper._info.text=val;
			helper._info.selectable = true;
		}
		public function setState( val:String):void
		{
			
			helper.setState(val);
			
		}
		public function setSlot(val:String):void
		{
			var colors:Array = [0xff6600, 0xffcc00, 0xff3399, 0xff0066, 0xcc00ff, 0x999900, 0x9999cc, 0x00cc99, 0x287200, 0x00ccff, 0x003366, 0x99ff00, 0xcc0000, 0x80cd68, 0x6600ff];
			var index:int = Math.max( 0, parseInt(val)-1 ) % colors.length;
			var color:uint = colors[ index ];
			var g:Graphics = (helper.phone.slot as MovieClip).graphics;
			g.clear();
			g.beginFill( color );
			g.drawRoundRect( 0, 0, 18, 17, 10.0, 10.0 );
			g.endFill();
		}
		public function onTick(val:int):void
		{
			helper.onTick(val);
			helper._timer.visible = true;	
		}
	}
}