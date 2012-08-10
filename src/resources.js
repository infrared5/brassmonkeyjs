(function(bm){

function getDataURL(img){
  var cvs = document.createElement('canvas'),
      ctx = cvs.getContext('2d');
  cvs.width = img.width;
  cvs.height = img.height;
  ctx.drawImage(img,0,0);
  
  var str = cvs.toDataURL().replace('data:image/png;base64,','');
  return str;
}

bm.loadImages = function(images,cb){
  // Early out if there were zero images in the list
  if(images.length==0){
    cb([]);
    return;
  }
  
  var imagesLoaded = 0,
      imageData = new Array(images.length);
      
  for(var i = 0;i<images.length;i++){
    (function(){
      var j = i,
          img = new Image();
      img.onload=function(){
        imageData[j] = getDataURL(img);
        imagesLoaded++;
        if(imagesLoaded==images.length){
          cb(imageData);
        }
      }
      img.src = images[j];
    })();
  }
}

function generateXMLFromdesign(design,imageData){
  
  var width,height;
  
  if(bm.options.design.orientation=="portrait"){
    width = 320;
    height = 480;
  } else{
    width = 480;
    height = 320;
  }
  
  var xml = '<?xml version="1.0" encoding="utf-8"?>\n'+
            '<BMApplicationScheme version="0.1" orientation="'+design.orientation+
            '" touchEnabled="'+(design.touchEnabled?'yes':'no')+
            '" accelerometerEnabled="'+(design.accelerometerEnabled?'yes':'no')+'">\n';
  
  // Create Resources Section
  if(imageData.length!=0){ 
    xml+= '<Resources>\n';
    for(var i = 0;i<imageData.length;i++){
      xml+='<Resource id="'+(i+1)+'" type="image">\n';
        xml+='<data><![CDATA['+imageData[i]+']]></data>\n';
      xml+='</Resource>\n';
    }  
    xml+= '</Resources>\n';
  } else {
    // No Resources were supplied
    xml+= '<Resources/>\n';
  }
  // Create Layout Section
  if(design.layout.length!=0){   
    xml+= '<Layout>\n';
    for(var i = 0;i<design.layout.length;i++){
      
      // NOTE: I ensure all DisplayObjects have handler attributes, but
      // this may not be necessary. Talk to Shaules/Zach to find out.
      // For now I do this so that users of the JS SDK don't need to provide something
      var handler = design.layout[i].handler;
      if(design.layout[i].type=="image"){
        handler = "nullHandler";
      }
    
      xml+='<DisplayObject type="'+design.layout[i].type+'" top="'+design.layout[i].y/height+'" left="'+design.layout[i].x/width+'" width="'+design.layout[i].width/width+'" height="'+design.layout[i].height/height+'" functionHandler="'+handler+'">\n';
      if(design.layout[i].type=="image"){
        xml+='<Asset name="up" resourceRef="'+(design.layout[i].image+1)+'" />\n';
      } else {
        xml+='<Asset name="up" resourceRef="'+(design.layout[i].imageUp+1)+'" />\n';
        xml+='<Asset name="down" resourceRef="'+(design.layout[i].imageDown+1)+'" />\n';
      }
      xml+='</DisplayObject>\n';
    }  
    xml+= '</Layout>\n';  
  } else {
    // No Layout was supplied
    xml+= '<Layout/>\n';
  }
  xml+='</BMApplicationScheme>';
  
  //xml = '<?xml version="1.0" encoding="utf-8"?><BMApplicationScheme version="0.1" orientation="landscape" touchEnabled="yes" accelerometerEnabled="no"><Resources /><Layout /></BMApplicationScheme>';
  //xml = //xml.replace(/\n/g,'');
  //console.log(xml);
  return xml;
}

bm.generateControllerXML = function(imageData){
  var xml = generateXMLFromdesign(bm.options.design,imageData);
  return xml;
}

})(BrassMonkey);