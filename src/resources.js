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

var cachedImages = {};
var requests = [];
var pendingImages = {};

var hasImages = function(request) {
  for(var i = request.length-1; i >= 0; --i) {
    if(!(request[i] in cachedImages)) {
      return false;
    }
  }

  return true;
};

var gatherImages = function(request) {
  var out = [];
  for(var i = 0; i < request.length; ++i) {
    out[i] = cachedImages[request[i]];
  }

  return out;
};

var checkCallbacks = function() {
  for(var i = requests.length-1; i >= 0 ; --i) {
    var images = requests[i].images;

    if(hasImages(images)) {
      requests[i].callback(gatherImages(images));
      requests.splice(i, 1);
    }
  }
};

var loadImage = function(url) {
  if(url in cachedImages || url in pendingImages) {
    return;
  }

  pendingImages[url] = true;

  var image = new Image();
  image.onload = function(){
    pendingImages[url] = false;
    cachedImages[url] = getDataURL(image);
    checkCallbacks();
  };
  image.src = url;
};

var loadImages = function(images, callback){
  if(hasImages(images)){
    if(callback) {
      callback(gatherImages(images));
    }
    return;
  }

  if(callback) {
    requests.push({images:images, callback:callback});
  }

  for(var i = 0;i<images.length;i++){
    loadImage(images[i]);
  }
};

bm.loadImages = loadImages;

var getResourceId = function(resources, name) {
  if(!name) {
    return -1;
  }

  var index = resources.indexOf(name);
  if(index < 0) {
    index = resources.length;
    resources.push(name);
  }
  return index+1;
};

function generateLayoutXml(design) {
  var layout = design.layout,
      width = design.width,
      height = design.height,
      resources = design._resources;
      lastId = design._lastObjectId || 0;

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
        xml+='<Asset name="up" resourceRef="'+getResourceId(resources, elem.src)+'" />';
      } else if(elem.type === "button") {
        xml+='<Asset name="up" resourceRef="'+getResourceId(resources, elem.srcUp)+'" />';
        xml+='<Asset name="down" resourceRef="'+getResourceId(resources, elem.srcDown)+'" />';
      }
      xml+='</DisplayObject>\n';
    }

    xml+= '</Layout>\n';
  } else {
    // No Layout was supplied
    xml = '<Layout/>\n';
  }

  design._lastObjectId = lastId;

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

  if(out._resources) {
    out._resources = out._resources.slice();
  }

  out.layout = clonedLayout;
  return out;
}

bm.cloneDesign = cloneDesign;

var collectResources = function(design) {
  var layout = design.layout,
      resources = design._resources;

  resources = resources || (design.preload ? design.preload.slice() : []);

  for(var i = 0; i<layout.length; i++) {
    var elem = layout[i];

    if(elem.type==="image"){
      getResourceId(resources, elem.src);
    } else if(elem.type === "button") {
      getResourceId(resources, elem.srcUp);
      getResourceId(resources, elem.srcDown);
    }
  }

  design._resources = resources;
  return resources;
};

var generateResourceXml = function(design, imageData) {

  var lastResource = design._lastResource || 0;
  var xml = '<Resources>\n';
  for(var i = lastResource; i<imageData.length;i++){
    xml += '<Resource id="'+(i+1)+'" type="image"><data><![CDATA['+imageData[i]+']]></data></Resource>\n';
  }
  xml += '</Resources>\n';

  design.lastResource = imageData.length;
  return xml;
};

var buildControllerXML = function(design,imageData) {

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

  xml += generateResourceXml(design, imageData);
  xml += generateLayoutXml(design);
  
  xml+='</BMApplicationScheme>';
  return xml;
};

bm.preloadDesignImages = function(design) {
  loadImages(collectResources(design));
};

bm.generateControllerXML = function(design, callback) {
  loadImages(collectResources(design), function(imageData) {
    callback(buildControllerXML(design, imageData));
  });
};

bm.generateUpdateXml = function(design) {
  return '<BMApplicationScheme>' + generateLayoutXml(design) + '</BMApplicationScheme>';
};

})(BrassMonkey);