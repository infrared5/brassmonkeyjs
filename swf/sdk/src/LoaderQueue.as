package
{
	import com.adobe.images.PNGEncoder;
	
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.geom.Point;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;

	[Event(name="complete", type="flash.events.Event")]
	public class LoaderQueue extends EventDispatcher
	{
		public var loader:Loader=new Loader();
		public var size:Point=new Point();
		public var base64:String;
		public var scale:Boolean;
		private var req:URLRequest;
		public var element:Object;
		public var parent:Object;
		public function LoaderQueue(name:String, uri:String,width:Number,height:Number,scaleSource:Boolean):void
		{
			scale=scaleSource;
			size.x=width;
			size.y=height;
			req=new URLRequest(uri);
			loader.name=name;
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onComplete);
			
		}
		public function load():void
		{
			loader.load(req);
		}
		public function get name():String
		{
			return loader.name;
		}
		
		private function onComplete(e:Event):void
		{
			if(scale)
			{
				loader.width=size.x;
				loader.height=size.y;
			}
			
			if(size.y==0 || size.x==0){
				size.y=loader.height;
				size.x=loader.width;
			}
			
			var bd:BitmapData=new BitmapData(size.x,size.y,true,0x0);
			bd.draw(loader);
		
			
			var ba:ByteArray=PNGEncoder.encode(bd);
			base64=Base64.encode(ba);
			dispatchEvent(new Event(Event.COMPLETE));
		}
	}
}