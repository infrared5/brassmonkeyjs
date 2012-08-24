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
  if(images.length===0){
    cb([]);
    return;
  }
  
  var imagesLoaded = 0,
      imageData = new Array(images.length);
      loadHandler = function(j) {
    var img = new Image();
    img.onload = function(){
      imageData[j] = getDataURL(img);
      imagesLoaded++;
      if(imagesLoaded==images.length){
        cb(imageData);
      }
    };
    img.src = images[j];
  };
      
  for(var i = 0;i<images.length;i++){
    loadHandler(i);
  }
};

function generateLayoutXml(design) {
  var layout = design.layout,
      width = design.width,
      height = design.height,
      lastId = design.lastObjectId || 0;

  var xml;
  if(layout.length !== 0){
    xml = '<Layout>\n';
    for(var i = 0; i<layout.length; i++) {
      var elem = layout[i];
      
      elem.id = elem.id || ++lastId;
    
      xml += '<DisplayObject type="'+elem.type+'" top="'+elem.y/height+
        '" left="'+elem.x/width+'" width="'+elem.width/width+
        '" height="'+elem.height/height+'"'+
        ' id="' +elem.id+ '"';
      
      if(elem.handler) {
        xml += ' functionHandler="'+elem.handler+'"';
      }

      if(elem.text) {
        xml += ' text="'+elem.text+'" textSize="' + Number(elem.textSize) / height + '"';
      }

      if(elem.color !== undefined) {
        xml += ' color="' + elem.color + '"';
      }

      if(elem.hidden) {
        xml += ' hidden="yes"';
      }

      xml += ' >';

      if(elem.type==="image"){
        xml+='<Asset name="up" resourceRef="'+(elem.image+1)+'" />';
      } else if(elem.type === "button") {
        xml+='<Asset name="up" resourceRef="'+(elem.imageUp+1)+'" />';
        xml+='<Asset name="down" resourceRef="'+(elem.imageDown+1)+'" />';
      }
      xml+='</DisplayObject>\n';
    }

    xml+= '</Layout>\n';
  } else {
    // No Layout was supplied
    xml = '<Layout/>\n';
  }

  design.lastObjectId = lastId;

  return xml;
}

function clone(obj) {
  var target = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      target[i] = obj[i];
    }
  }
  return target;
}

function cloneDesign(source) {
  var out = clone(source),
      sourceLayout = source.layout,
      length = sourceLayout.length,
      clonedLayout = new Array(length);

  while(length--) {
    clonedLayout[length] = clone(sourceLayout[length]);
  }

  out.layout = clonedLayout;
  return out;
}

bm.cloneDesign = cloneDesign;

bm.generateControllerXML = function(design,imageData) {

  if(design.orientation=="portrait"){
    design.width = 320;
    design.height = 480;
  } else {
    design.width = 480;
    design.height = 320;
  }
  
  var xml = '<?xml version="1.0" encoding="utf-8"?>\n'+
            '<BMApplicationScheme version="0.1" orientation="'+design.orientation+
            '" touchEnabled="'+(design.touchEnabled?'yes':'no')+
            '" accelerometerEnabled="'+(design.accelerometerEnabled?'yes':'no')+'">\n';
  
  // Create Resources Section
  if(imageData.length!==0){
    xml+= '<Resources>\n';
    for(var i = 0; i<imageData.length;i++){
      xml+='<Resource id="'+(i+1)+'" type="image"><data><![CDATA['+imageData[i]+']]></data></Resource>\n';
    }
    xml+= '</Resources>\n';
  } else {
    // No Resources were supplied
    xml+= '<Resources/>\n';
  }
  // Create Layout Section
  xml += generateLayoutXml(design);
  
  xml+='</BMApplicationScheme>';
  return xml;
};

bm.generateUpdateXml = function(design) {
  return '<BMApplicationScheme>' + generateLayoutXml(design) + '</BMApplicationScheme>';
};

})(BrassMonkey);