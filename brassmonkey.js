function brassmonkeySwfObject(){swfobject=function(){function s(){if(!w){try{var d=f.getElementsByTagName("body")[0].appendChild(f.createElement("span"));d.parentNode.removeChild(d)}catch(k){return}w=true;for(var d=K.length,a=0;a<d;a++)K[a]()}}function F(d){w?d():K[K.length]=d}function G(d){if(typeof r.addEventListener!=m)r.addEventListener("load",d,false);else if(typeof f.addEventListener!=m)f.addEventListener("load",d,false);else if(typeof r.attachEvent!=m)a(r,"onload",d);else if(typeof r.onload==
"function"){var k=r.onload;r.onload=function(){k();d()}}else r.onload=d}function L(){var d=f.getElementsByTagName("body")[0],k=f.createElement(q);k.setAttribute("type",x);var a=d.appendChild(k);if(a){var l=0;(function(){if(typeof a.GetVariable!=m){var h=a.GetVariable("$version");if(h)h=h.split(" ")[1].split(","),g.pv=[parseInt(h[0],10),parseInt(h[1],10),parseInt(h[2],10)]}else if(l<10){l++;setTimeout(arguments.callee,10);return}d.removeChild(k);a=null;H()})()}else H()}function H(){var d=u.length;
if(d>0)for(var k=0;k<d;k++){var a=u[k].id,l=u[k].callbackFn,h={success:false,id:a};if(g.pv[0]>0){var f=p(a);if(f)if(b(u[k].swfVersion)&&!(g.wk&&g.wk<312)){if(c(a,true),l)h.success=true,h.ref=I(a),l(h)}else if(u[k].expressInstall&&C()){h={};h.data=u[k].expressInstall;h.width=f.getAttribute("width")||"0";h.height=f.getAttribute("height")||"0";if(f.getAttribute("class"))h.styleclass=f.getAttribute("class");if(f.getAttribute("align"))h.align=f.getAttribute("align");for(var R={},f=f.getElementsByTagName("param"),
e=f.length,q=0;q<e;q++)f[q].getAttribute("name").toLowerCase()!="movie"&&(R[f[q].getAttribute("name")]=f[q].getAttribute("value"));z(h,R,a,l)}else A(f),l&&l(h)}else if(c(a,true),l){if((a=I(a))&&typeof a.SetVariable!=m)h.success=true,h.ref=a;l(h)}}}function I(d){var a=null;if((d=p(d))&&d.nodeName=="OBJECT")typeof d.SetVariable!=m?a=d:(d=d.getElementsByTagName(q)[0])&&(a=d);return a}function C(){return!M&&b("6.0.65")&&(g.win||g.mac)&&!(g.wk&&g.wk<312)}function z(d,a,o,l){M=true;P=l||null;S={success:false,
id:o};var h=p(o);if(h){h.nodeName=="OBJECT"?(J=D(h),N=null):(J=h,N=o);d.id=T;if(typeof d.width==m||!/%$/.test(d.width)&&parseInt(d.width,10)<310)d.width="310";if(typeof d.height==m||!/%$/.test(d.height)&&parseInt(d.height,10)<137)d.height="137";f.title=f.title.slice(0,47)+" - Flash Player Installation";l=g.ie&&g.win?"ActiveX":"PlugIn";l="MMredirectURL="+encodeURI(window.location).toString().replace(/&/g,"%26")+"&MMplayerType="+l+"&MMdoctitle="+f.title;typeof a.flashvars!=m?a.flashvars+="&"+l:a.flashvars=
l;if(g.ie&&g.win&&h.readyState!=4)l=f.createElement("div"),o+="SWFObjectNew",l.setAttribute("id",o),h.parentNode.insertBefore(l,h),h.style.display="none",function(){h.readyState==4?h.parentNode.removeChild(h):setTimeout(arguments.callee,10)}();n(d,a,o)}}function A(d){if(g.ie&&g.win&&d.readyState!=4){var a=f.createElement("div");d.parentNode.insertBefore(a,d);a.parentNode.replaceChild(D(d),a);d.style.display="none";(function(){d.readyState==4?d.parentNode.removeChild(d):setTimeout(arguments.callee,
10)})()}else d.parentNode.replaceChild(D(d),d)}function D(d){var a=f.createElement("div");if(g.win&&g.ie)a.innerHTML=d.innerHTML;else if(d=d.getElementsByTagName(q)[0])if(d=d.childNodes)for(var o=d.length,l=0;l<o;l++)!(d[l].nodeType==1&&d[l].nodeName=="PARAM")&&d[l].nodeType!=8&&a.appendChild(d[l].cloneNode(true));return a}function n(d,a,o){var l,h=p(o);if(g.wk&&g.wk<312)return l;if(h){if(typeof d.id==m)d.id=o;if(g.ie&&g.win){var c="",b;for(b in d)if(d[b]!=Object.prototype[b])b.toLowerCase()=="data"?
a.movie=d[b]:b.toLowerCase()=="styleclass"?c+=' class="'+d[b]+'"':b.toLowerCase()!="classid"&&(c+=" "+b+'="'+d[b]+'"');b="";for(var e in a)a[e]!=Object.prototype[e]&&(b+='<param name="'+e+'" value="'+a[e]+'" />');h.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+c+">"+b+"</object>";O[O.length]=d.id;l=p(d.id)}else{e=f.createElement(q);e.setAttribute("type",x);for(var i in d)d[i]!=Object.prototype[i]&&(i.toLowerCase()=="styleclass"?e.setAttribute("class",d[i]):i.toLowerCase()!=
"classid"&&e.setAttribute(i,d[i]));for(c in a)a[c]!=Object.prototype[c]&&c.toLowerCase()!="movie"&&(d=e,b=c,i=a[c],o=f.createElement("param"),o.setAttribute("name",b),o.setAttribute("value",i),d.appendChild(o));h.parentNode.replaceChild(e,h);l=e}}return l}function B(d){var a=p(d);if(a&&a.nodeName=="OBJECT")g.ie&&g.win?(a.style.display="none",function(){if(a.readyState==4){var o=p(d);if(o){for(var b in o)typeof o[b]=="function"&&(o[b]=null);o.parentNode.removeChild(o)}}else setTimeout(arguments.callee,
10)}()):a.parentNode.removeChild(a)}function p(a){var k=null;try{k=f.getElementById(a)}catch(b){}return k}function a(a,k,b){a.attachEvent(k,b);E[E.length]=[a,k,b]}function b(a){var k=g.pv,a=a.split(".");a[0]=parseInt(a[0],10);a[1]=parseInt(a[1],10)||0;a[2]=parseInt(a[2],10)||0;return k[0]>a[0]||k[0]==a[0]&&k[1]>a[1]||k[0]==a[0]&&k[1]==a[1]&&k[2]>=a[2]?true:false}function e(a,k,b,c){if(!g.ie||!g.mac){var h=f.getElementsByTagName("head")[0];if(h){b=b&&typeof b=="string"?b:"screen";c&&(Q=t=null);if(!t||
Q!=b)c=f.createElement("style"),c.setAttribute("type","text/css"),c.setAttribute("media",b),t=h.appendChild(c),g.ie&&g.win&&typeof f.styleSheets!=m&&f.styleSheets.length>0&&(t=f.styleSheets[f.styleSheets.length-1]),Q=b;g.ie&&g.win?t&&typeof t.addRule==q&&t.addRule(a,k):t&&typeof f.createTextNode!=m&&t.appendChild(f.createTextNode(a+" {"+k+"}"))}}}function c(a,k){if(U){var b=k?"visible":"hidden";w&&p(a)?p(a).style.visibility=b:e("#"+a,"visibility:"+b)}}function i(a){return/[\\\"<>\.;]/.exec(a)!=null&&
typeof encodeURIComponent!=m?encodeURIComponent(a):a}var m="undefined",q="object",x="application/x-shockwave-flash",T="SWFObjectExprInst",r=window,f=document,v=navigator,V=false,K=[function(){V?L():H()}],u=[],O=[],E=[],J,N,P,S,w=false,M=false,t,Q,U=true,g=function(){var a=typeof f.getElementById!=m&&typeof f.getElementsByTagName!=m&&typeof f.createElement!=m,b=v.userAgent.toLowerCase(),c=v.platform.toLowerCase(),g=c?/win/.test(c):/win/.test(b),c=c?/mac/.test(c):/mac/.test(b),b=/webkit/.test(b)?parseFloat(b.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,
"$1")):false,h=!+"\u000b1",e=[0,0,0],i=null;if(typeof v.plugins!=m&&typeof v.plugins["Shockwave Flash"]==q){if((i=v.plugins["Shockwave Flash"].description)&&!(typeof v.mimeTypes!=m&&v.mimeTypes[x]&&!v.mimeTypes[x].enabledPlugin))V=true,h=false,i=i.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),e[0]=parseInt(i.replace(/^(.*)\..*$/,"$1"),10),e[1]=parseInt(i.replace(/^.*\.(.*)\s.*$/,"$1"),10),e[2]=/[a-zA-Z]/.test(i)?parseInt(i.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}else if(typeof r.ActiveXObject!=m)try{var n=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
if(n&&(i=n.GetVariable("$version")))h=true,i=i.split(" ")[1].split(","),e=[parseInt(i[0],10),parseInt(i[1],10),parseInt(i[2],10)]}catch(p){}return{w3:a,pv:e,wk:b,ie:h,win:g,mac:c}}();(function(){g.w3&&((typeof f.readyState!=m&&f.readyState=="complete"||typeof f.readyState==m&&(f.getElementsByTagName("body")[0]||f.body))&&s(),w||(typeof f.addEventListener!=m&&f.addEventListener("DOMContentLoaded",s,false),g.ie&&g.win&&(f.attachEvent("onreadystatechange",function(){f.readyState=="complete"&&(f.detachEvent("onreadystatechange",
arguments.callee),s())}),r==top&&function(){if(!w){try{f.documentElement.doScroll("left")}catch(a){setTimeout(arguments.callee,0);return}s()}}()),g.wk&&function(){w||(/loaded|complete/.test(f.readyState)?s():setTimeout(arguments.callee,0))}(),G(s)))})();(function(){g.ie&&g.win&&window.attachEvent("onunload",function(){for(var a=E.length,b=0;b<a;b++)E[b][0].detachEvent(E[b][1],E[b][2]);a=O.length;for(b=0;b<a;b++)B(O[b]);for(var c in g)g[c]=null;g=null;for(var e in swfobject)swfobject[e]=null;swfobject=
null})})();return{registerObject:function(a,b,e,f){if(g.w3&&a&&b){var h={};h.id=a;h.swfVersion=b;h.expressInstall=e;h.callbackFn=f;u[u.length]=h;c(a,false)}else f&&f({success:false,id:a})},getObjectById:function(a){if(g.w3)return I(a)},embedSWF:function(a,e,f,i,h,p,x,r,t,s){var u={success:false,id:e};g.w3&&!(g.wk&&g.wk<312)&&a&&e&&f&&i&&h?(c(e,false),F(function(){f+="";i+="";var g={};if(t&&typeof t===q)for(var y in t)g[y]=t[y];g.data=a;g.width=f;g.height=i;y={};if(r&&typeof r===q)for(var v in r)y[v]=
r[v];if(x&&typeof x===q)for(var w in x)typeof y.flashvars!=m?y.flashvars+="&"+w+"="+x[w]:y.flashvars=w+"="+x[w];if(b(h))v=n(g,y,e),g.id==e&&c(e,true),u.success=true,u.ref=v;else if(p&&C()){g.data=p;z(g,y,e,s);return}else c(e,true);s&&s(u)})):s&&s(u)},switchOffAutoHideShow:function(){U=false},ua:g,getFlashPlayerVersion:function(){return{major:g.pv[0],minor:g.pv[1],release:g.pv[2]}},hasFlashPlayerVersion:b,createSWF:function(a,b,c){if(g.w3)return n(a,b,c)},showExpressInstall:function(a,b,c,e){g.w3&&
C()&&z(a,b,c,e)},removeSWF:function(a){g.w3&&B(a)},createCSS:function(a,b,c,f){g.w3&&e(a,b,c,f)},addDomLoadEvent:F,addLoadEvent:G,getQueryParamValue:function(a){var b=f.location.search||f.location.hash;if(b){/\?/.test(b)&&(b=b.split("?")[1]);if(a==null)return i(b);for(var b=b.split("&"),c=0;c<b.length;c++)if(b[c].substring(0,b[c].indexOf("="))==a)return i(b[c].substring(b[c].indexOf("=")+1))}return""},expressInstallCallback:function(){if(M){var a=p(T);if(a&&J){a.parentNode.replaceChild(J,a);if(N&&
(c(N,true),g.ie&&g.win))J.style.display="block";P&&P(S)}M=false}}}}()};(function(){function s(a,b){var e=[];bm["on"+a]=function(a){e.push(a)};bm["on"+a+"Internal"]=function(){if(b){bm.log("on"+a+"(");for(var c=0;c<arguments.length;c++)bm.log("    "+JSON.stringify(arguments[c]));bm.log(")")}if(a=="NavigationString")if((arguments[1]=="left"||arguments[1]=="right"||arguments[1]=="up"||arguments[1]=="down"||arguments[1]=="back"||arguments[1]=="activate")&&!D){for(var i=arguments[1],c=0;c<e.length;c++){arguments[1]=i+"Down";try{e[c].apply(bm,arguments)}catch(m){console.log("UnhandledException ("+
m+") in "+bmHooks[j]+" Callback")}arguments[1]=i+"Clicked";try{e[c].apply(bm,arguments)}catch(q){console.log("UnhandledException ("+q+") in "+bmHooks[j]+" Callback")}}arguments[1]=i+"Up"}else D=true;for(c=0;c<e.length;c++)try{e[c].apply(bm,arguments)}catch(n){console.log("UnhandledException ("+n+") in "+bmHooks[j]+" Callback")}}}function F(){function a(a){var b=document.createElement("div");b.id="brassmonkey-wrapper"+Math.floor(Math.random()*281474943156225).toString(16);document.body.appendChild(b);
b.style.zIndex=1E4;b.style.position="fixed";b.style.width="8px";b.style.height="8px";b.style.left="0px";b.style.bottom="0px";b.style.overflowX="hidden";b.style.overflowY="hidden";var c=document.createElement("div");c.id="brassmonkey-wrapper"+Math.floor(Math.random()*281474943156225).toString(16);b.appendChild(c);b=bm.options.name;a=typeof bm.options.design=="string"?bm.options.design:encodeURIComponent(H(bm.options.design,a));a={bmDeviceName:b,wmode:"window",debug:"true",bmControllerXML:a};window.parent.passingObj!==
void 0&&window.parent.passingObj.appId!==void 0&&window.parent.passingObj.portalId!==void 0?(a.bmDeviceId=window.parent.passingObj.appId,a.bmPortalId=window.parent.passingObj.portalId):a.bmDeviceId=Math.floor(Math.random()*281474943156225).toString(16);bm.deviceId=a.bmDeviceId;swfobject.embedSWF(bm.options.swfURL,c.id,"1","1","9.0.124","",a,{quality:"high",bgcolor:"#ffffff",allowscriptaccess:"always",allowfullscreen:"true"},{id:"brassmonkey",name:"Play Brass Monkey",align:"middle",style:"float:left;z-index:-1;position:absolute;margin-top:-1px;"},
function(a){a.success===false&&bm.options.error!==void 0?bm.options.error("noflash"):a.success===true&&bm.options.error!==void 0&&bm.options.success()})}if(typeof bm.options.design=="string")a([]);else if(bm.options.design.images.length==0)a([]);else if(I()==-1)for(var b=0,e=Array(bm.options.design.images.length),c=0;c<bm.options.design.images.length;c++)(function(){var i=c,m=new Image;m.onload=function(){var c;c=document.createElement("canvas");var n=c.getContext("2d");c.width=m.width;c.height=m.height;
n.drawImage(m,0,0);c=c.toDataURL().replace("data:image/png;base64,","");e[i]=c;b++;b==bm.options.design.images.length&&a(e)};m.src=bm.options.design.images[c]})()}function G(a){a/=bm.options.design.orientation=="portrait"?320:480;return a}function L(a){a/=bm.options.design.orientation=="portrait"?480:320;return a}function H(a,b){var e='<?xml version="1.0" encoding="utf-8"?>\n<BMApplicationScheme version="0.1" orientation="'+a.orientation+'" touchEnabled="'+(a.touchEnabled?"yes":"no")+'" accelerometerEnabled="'+
(a.accelerometerEnabled?"yes":"no")+'">\n';if(b.length!=0){e+="<Resources>\n";for(var c=0;c<b.length;c++)e+='<Resource id="'+(c+1)+'" type="image">\n',e+="<data><![CDATA["+b[c]+"]]\></data>\n",e+="</Resource>\n";e+="</Resources>\n"}else e+="<Resources/>\n";if(a.layout.length!=0){e+="<Layout>\n";for(c=0;c<a.layout.length;c++){var i=a.layout[c].handler;a.layout[c].type=="image"&&(i="nullHandler");e+='<DisplayObject type="'+a.layout[c].type+'" top="'+L(a.layout[c].y)+'" left="'+G(a.layout[c].x)+'" width="'+
G(a.layout[c].width)+'" height="'+L(a.layout[c].height)+'" functionHandler="'+i+'">\n';a.layout[c].type=="image"?e+='<Asset name="up" resourceRef="'+(a.layout[c].image+1)+'" />\n':(e+='<Asset name="up" resourceRef="'+(a.layout[c].imageUp+1)+'" />\n',e+='<Asset name="down" resourceRef="'+(a.layout[c].imageDown+1)+'" />\n');e+="</DisplayObject>\n"}e+="</Layout>\n"}else e+="<Layout/>\n";e+="</BMApplicationScheme>";return e}function I(){var a=-1;navigator.appName=="Microsoft Internet Explorer"&&/MSIE ([0-9]{1,}[.0-9]{0,})/.exec(navigator.userAgent)!=
null&&(a=parseFloat(RegExp.$1));return a}bm={version:"0.3.0",visible:true};window.swfobject===void 0&&brassmonkeySwfObject();bm.init=function(a){bm.options=a;bm.options.logging=a.logging?a.logging:false;bm.options.swfURL=a.swfURL?a.swfURL:"http://s3.amazonaws.com/files.playbrassmonkey.com/sdks/js/v"+bm.version.replace(/\./g,"-")+"/brassmonkey.swf";bm.options.design.images=a.design.images?a.design.images:[];bm.options.design.layout=a.design.layout?a.design.layout:[]};for(var C="#ff6600,#ffcc00,#ff3399,#ff0066,#cc00ff,#999900,#9999cc,#00cc99,#287200,#00ccff,#003366,#99ff00,#cc0000,#80cd68,#6600ff".split(","),
z="DeviceAvailable,DeviceConnected,DeviceDisconnected,NavigationString,KeyString,Invocation,ShakeReceived,AccelReceived,Log,ShowSlot".split(","),A=0;A<z.length;A++)s(z[A],z[A]!="AccelReceived"&&z[A]!="Log");bm.log=function(a){if(bm.options.logging)bm.onLogInternal(a)};var D=false;bm.showSlotInternal=function(a){bm.onShowSlotInternal(C[(Math.max(1,a)-1)%C.length])};var n=[];bm.getControllerSlot=function(a){for(var b=0;b<n.length;b++)if(n[b]==a)return b};bm.getControllerCount=function(){for(var a=0,
b=0;b<n.length;b++)n[b]!==void 0&&a++;return a};bm.getControllers=function(){for(var a=[],b=0;b<n.length;b++)n[b]!==void 0&&a.push(n[b]);return a};var B={};bm.getDeviceName=function(a){return B[a]};bm.onDeviceConnected(function(a){B[a.deviceId]=a.deviceName;for(var b=0;b<n.length;b++)if(n[b]===void 0){n[b]=a.deviceId;return}n.push(a.deviceId)});bm.onDeviceDisconnected(function(a){delete B[a.deviceId];for(var b=0;b<n.length;b++)if(n[b]==a.deviceId){n[b]=void 0;break}bm.getControllerCount()});bm.isDeviceConnected=
function(a){return B[a.deviceId]==void 0?false:true};var p=[];bm.onTouchesReceived=function(a){p.push(a)};bm.onTouchesReceivedInternal=function(a){for(var b=0;b<a.touches.length;b++)for(var e=a.touches[b],c=0;c<p.length;c++)p[c](e,a.deviceId)};bm.onSocketReady=function(){};bm.setNavMode=function(a){document.getElementById("brassmonkey")&&document.getElementById("brassmonkey").SetNavMode!==void 0&&document.getElementById("brassmonkey").SetNavMode(typeof a==="undefined"?"":a)};bm.setKeyboardMode=function(a,
b){if(document.getElementById("brassmonkey")&&document.getElementById("brassmonkey").SetKeyboardMode!==void 0){var e;document.getElementById("brassmonkey").SetKeyboardMode(typeof a==="undefined"?"":a,typeof b==="undefined"?"":b)}};bm.setGamepadMode=function(a){document.getElementById("brassmonkey")&&document.getElementById("brassmonkey").SetGamepadMode!==void 0&&document.getElementById("brassmonkey").SetGamepadMode(typeof a==="undefined"?"":a)};bm.setVisibility=function(a){if(document.getElementById("brassmonkey")&&
document.getElementById("brassmonkey").SetVisibility!==void 0&&bm.visible!=a)document.getElementById("brassmonkey").SetVisibility(a,true),bm.visible=a};bm.getVisibility=function(){return bm.visible};bm.enableAccelerometer=function(a,b,e){setTimeout(function(){document.getElementById("brassmonkey").EnableAccelerometer(a,b,e)},2E3)};bm.enableTouch=function(a,b,e){setTimeout(function(){document.getElementById("brassmonkey").EnableTouch(a,b,e)},2E3)};bm.getWidth=function(){return window.parent.passingObj!==
void 0&&window.parent.passingObj.width!==void 0?window.parent.passingObj.width:-1};bm.getHeight=function(){return window.parent.passingObj!==void 0&&window.parent.passingObj.height!==void 0?window.parent.passingObj.height:-1};bm.getFullscreen=function(){return window.parent.passingObj!==void 0&&window.parent.passingObj.fullScreen!==void 0?window.parent.passingObj.fullScreen:false};window.addEventListener?window.addEventListener("DOMContentLoaded",F,false):window.attachEvent("onload",F)})();
