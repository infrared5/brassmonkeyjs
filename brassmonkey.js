function brassmonkeySwfObject(){swfobject=function(){function q(){if(!B){try{var b=h.getElementsByTagName("body")[0].appendChild(h.createElement("span"));b.parentNode.removeChild(b)}catch(e){return}B=true;for(var b=J.length,a=0;a<b;a++)J[a]()}}function E(b){B?b():J[J.length]=b}function F(b){if(typeof s.addEventListener!=m)s.addEventListener("load",b,false);else if(typeof h.addEventListener!=m)h.addEventListener("load",b,false);else if(typeof s.attachEvent!=m)g(s,"onload",b);else if(typeof s.onload==
"function"){var e=s.onload;s.onload=function(){e();b()}}else s.onload=b}function K(){var b=h.getElementsByTagName("body")[0],e=h.createElement(v);e.setAttribute("type",L);var a=b.appendChild(e);if(a){var u=0;(function(){if(typeof a.GetVariable!=m){var i=a.GetVariable("$version");if(i)i=i.split(" ")[1].split(","),d.pv=[parseInt(i[0],10),parseInt(i[1],10),parseInt(i[2],10)]}else if(u<10){u++;setTimeout(arguments.callee,10);return}b.removeChild(e);a=null;G()})()}else G()}function G(){var b=t.length;
if(b>0)for(var e=0;e<b;e++){var r=t[e].id,u=t[e].callbackFn,i={success:false,id:r};if(d.pv[0]>0){var c=a(r);if(c)if(f(t[e].swfVersion)&&!(d.wk&&d.wk<312)){if(l(r,true),u)i.success=true,i.ref=H(r),u(i)}else if(t[e].expressInstall&&x()){i={};i.data=t[e].expressInstall;i.width=c.getAttribute("width")||"0";i.height=c.getAttribute("height")||"0";if(c.getAttribute("class"))i.styleclass=c.getAttribute("class");if(c.getAttribute("align"))i.align=c.getAttribute("align");for(var g={},c=c.getElementsByTagName("param"),
h=c.length,o=0;o<h;o++)c[o].getAttribute("name").toLowerCase()!="movie"&&(g[c[o].getAttribute("name")]=c[o].getAttribute("value"));w(i,g,r,u)}else M(c),u&&u(i)}else if(l(r,true),u){if((r=H(r))&&typeof r.SetVariable!=m)i.success=true,i.ref=r;u(i)}}}function H(b){var e=null;if((b=a(b))&&b.nodeName=="OBJECT")typeof b.SetVariable!=m?e=b:(b=b.getElementsByTagName(v)[0])&&(e=b);return e}function x(){return!N&&f("6.0.65")&&(d.win||d.mac)&&!(d.wk&&d.wk<312)}function w(b,e,r,c){N=true;Q=c||null;S={success:false,
id:r};var i=a(r);if(i){i.nodeName=="OBJECT"?(I=k(i),O=null):(I=i,O=r);b.id=T;if(typeof b.width==m||!/%$/.test(b.width)&&parseInt(b.width,10)<310)b.width="310";if(typeof b.height==m||!/%$/.test(b.height)&&parseInt(b.height,10)<137)b.height="137";h.title=h.title.slice(0,47)+" - Flash Player Installation";c=d.ie&&d.win?"ActiveX":"PlugIn";c="MMredirectURL="+encodeURI(window.location).toString().replace(/&/g,"%26")+"&MMplayerType="+c+"&MMdoctitle="+h.title;typeof e.flashvars!=m?e.flashvars+="&"+c:e.flashvars=
c;if(d.ie&&d.win&&i.readyState!=4)c=h.createElement("div"),r+="SWFObjectNew",c.setAttribute("id",r),i.parentNode.insertBefore(c,i),i.style.display="none",function(){i.readyState==4?i.parentNode.removeChild(i):setTimeout(arguments.callee,10)}();y(b,e,r)}}function M(b){if(d.ie&&d.win&&b.readyState!=4){var e=h.createElement("div");b.parentNode.insertBefore(e,b);e.parentNode.replaceChild(k(b),e);b.style.display="none";(function(){b.readyState==4?b.parentNode.removeChild(b):setTimeout(arguments.callee,
10)})()}else b.parentNode.replaceChild(k(b),b)}function k(b){var e=h.createElement("div");if(d.win&&d.ie)e.innerHTML=b.innerHTML;else if(b=b.getElementsByTagName(v)[0])if(b=b.childNodes)for(var a=b.length,c=0;c<a;c++)!(b[c].nodeType==1&&b[c].nodeName=="PARAM")&&b[c].nodeType!=8&&e.appendChild(b[c].cloneNode(true));return e}function y(b,e,c){var g,i=a(c);if(d.wk&&d.wk<312)return g;if(i){if(typeof b.id==m)b.id=c;if(d.ie&&d.win){var f="",n;for(n in b)if(b[n]!=Object.prototype[n])n.toLowerCase()=="data"?
e.movie=b[n]:n.toLowerCase()=="styleclass"?f+=' class="'+b[n]+'"':n.toLowerCase()!="classid"&&(f+=" "+n+'="'+b[n]+'"');n="";for(var l in e)e[l]!=Object.prototype[l]&&(n+='<param name="'+l+'" value="'+e[l]+'" />');i.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+f+">"+n+"</object>";P[P.length]=b.id;g=a(b.id)}else{l=h.createElement(v);l.setAttribute("type",L);for(var o in b)b[o]!=Object.prototype[o]&&(o.toLowerCase()=="styleclass"?l.setAttribute("class",b[o]):o.toLowerCase()!=
"classid"&&l.setAttribute(o,b[o]));for(f in e)e[f]!=Object.prototype[f]&&f.toLowerCase()!="movie"&&(b=l,n=f,o=e[f],c=h.createElement("param"),c.setAttribute("name",n),c.setAttribute("value",o),b.appendChild(c));i.parentNode.replaceChild(l,i);g=l}}return g}function C(b){var e=a(b);if(e&&e.nodeName=="OBJECT")d.ie&&d.win?(e.style.display="none",function(){if(e.readyState==4){var c=a(b);if(c){for(var d in c)typeof c[d]=="function"&&(c[d]=null);c.parentNode.removeChild(c)}}else setTimeout(arguments.callee,
10)}()):e.parentNode.removeChild(e)}function a(b){var e=null;try{e=h.getElementById(b)}catch(a){}return e}function g(b,e,a){b.attachEvent(e,a);D[D.length]=[b,e,a]}function f(b){var e=d.pv,b=b.split(".");b[0]=parseInt(b[0],10);b[1]=parseInt(b[1],10)||0;b[2]=parseInt(b[2],10)||0;return e[0]>b[0]||e[0]==b[0]&&e[1]>b[1]||e[0]==b[0]&&e[1]==b[1]&&e[2]>=b[2]?true:false}function c(b,e,a,c){if(!d.ie||!d.mac){var i=h.getElementsByTagName("head")[0];if(i){a=a&&typeof a=="string"?a:"screen";c&&(R=p=null);if(!p||
R!=a)c=h.createElement("style"),c.setAttribute("type","text/css"),c.setAttribute("media",a),p=i.appendChild(c),d.ie&&d.win&&typeof h.styleSheets!=m&&h.styleSheets.length>0&&(p=h.styleSheets[h.styleSheets.length-1]),R=a;d.ie&&d.win?p&&typeof p.addRule==v&&p.addRule(b,e):p&&typeof h.createTextNode!=m&&p.appendChild(h.createTextNode(b+" {"+e+"}"))}}}function l(b,e){if(U){var d=e?"visible":"hidden";B&&a(b)?a(b).style.visibility=d:c("#"+b,"visibility:"+d)}}function z(b){return/[\\\"<>\.;]/.exec(b)!=null&&
typeof encodeURIComponent!=m?encodeURIComponent(b):b}var m="undefined",v="object",L="application/x-shockwave-flash",T="SWFObjectExprInst",s=window,h=document,A=navigator,V=false,J=[function(){V?K():G()}],t=[],P=[],D=[],I,O,Q,S,B=false,N=false,p,R,U=true,d=function(){var b=typeof h.getElementById!=m&&typeof h.getElementsByTagName!=m&&typeof h.createElement!=m,e=A.userAgent.toLowerCase(),a=A.platform.toLowerCase(),c=a?/win/.test(a):/win/.test(e),a=a?/mac/.test(a):/mac/.test(e),e=/webkit/.test(e)?parseFloat(e.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,
"$1")):false,d=!+"\u000b1",g=[0,0,0],f=null;if(typeof A.plugins!=m&&typeof A.plugins["Shockwave Flash"]==v){if((f=A.plugins["Shockwave Flash"].description)&&!(typeof A.mimeTypes!=m&&A.mimeTypes[L]&&!A.mimeTypes[L].enabledPlugin))V=true,d=false,f=f.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),g[0]=parseInt(f.replace(/^(.*)\..*$/,"$1"),10),g[1]=parseInt(f.replace(/^.*\.(.*)\s.*$/,"$1"),10),g[2]=/[a-zA-Z]/.test(f)?parseInt(f.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}else if(typeof s.ActiveXObject!=m)try{var l=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
if(l&&(f=l.GetVariable("$version")))d=true,f=f.split(" ")[1].split(","),g=[parseInt(f[0],10),parseInt(f[1],10),parseInt(f[2],10)]}catch(o){}return{w3:b,pv:g,wk:e,ie:d,win:c,mac:a}}();(function(){d.w3&&((typeof h.readyState!=m&&h.readyState=="complete"||typeof h.readyState==m&&(h.getElementsByTagName("body")[0]||h.body))&&q(),B||(typeof h.addEventListener!=m&&h.addEventListener("DOMContentLoaded",q,false),d.ie&&d.win&&(h.attachEvent("onreadystatechange",function(){h.readyState=="complete"&&(h.detachEvent("onreadystatechange",
arguments.callee),q())}),s==top&&function(){if(!B){try{h.documentElement.doScroll("left")}catch(b){setTimeout(arguments.callee,0);return}q()}}()),d.wk&&function(){B||(/loaded|complete/.test(h.readyState)?q():setTimeout(arguments.callee,0))}(),F(q)))})();(function(){d.ie&&d.win&&window.attachEvent("onunload",function(){for(var b=D.length,a=0;a<b;a++)D[a][0].detachEvent(D[a][1],D[a][2]);b=P.length;for(a=0;a<b;a++)C(P[a]);for(var c in d)d[c]=null;d=null;for(var f in swfobject)swfobject[f]=null;swfobject=
null})})();return{registerObject:function(b,a,c,f){if(d.w3&&b&&a){var g={};g.id=b;g.swfVersion=a;g.expressInstall=c;g.callbackFn=f;t[t.length]=g;l(b,false)}else f&&f({success:false,id:b})},getObjectById:function(b){if(d.w3)return H(b)},embedSWF:function(b,a,c,g,i,h,n,k,o,z){var s={success:false,id:a};d.w3&&!(d.wk&&d.wk<312)&&b&&a&&c&&g&&i?(l(a,false),E(function(){c+="";g+="";var d={};if(o&&typeof o===v)for(var p in o)d[p]=o[p];d.data=b;d.width=c;d.height=g;p={};if(k&&typeof k===v)for(var q in k)p[q]=
k[q];if(n&&typeof n===v)for(var t in n)typeof p.flashvars!=m?p.flashvars+="&"+t+"="+n[t]:p.flashvars=t+"="+n[t];if(f(i))q=y(d,p,a),d.id==a&&l(a,true),s.success=true,s.ref=q;else if(h&&x()){d.data=h;w(d,p,a,z);return}else l(a,true);z&&z(s)})):z&&z(s)},switchOffAutoHideShow:function(){U=false},ua:d,getFlashPlayerVersion:function(){return{major:d.pv[0],minor:d.pv[1],release:d.pv[2]}},hasFlashPlayerVersion:f,createSWF:function(b,a,c){if(d.w3)return y(b,a,c)},showExpressInstall:function(b,a,c,f){d.w3&&
x()&&w(b,a,c,f)},removeSWF:function(a){d.w3&&C(a)},createCSS:function(a,e,f,g){d.w3&&c(a,e,f,g)},addDomLoadEvent:E,addLoadEvent:F,getQueryParamValue:function(a){var c=h.location.search||h.location.hash;if(c){/\?/.test(c)&&(c=c.split("?")[1]);if(a==null)return z(c);for(var c=c.split("&"),d=0;d<c.length;d++)if(c[d].substring(0,c[d].indexOf("="))==a)return z(c[d].substring(c[d].indexOf("=")+1))}return""},expressInstallCallback:function(){if(N){var b=a(T);if(b&&I){b.parentNode.replaceChild(I,b);if(O&&
(l(O,true),d.ie&&d.win))I.style.display="block";Q&&Q(S)}N=false}}}}()};(function(){function q(a,g){var f=[];bm["on"+a]=function(a){f.push(a)};bm["on"+a+"Internal"]=function(){if(g){bm.log("on"+a+"(");for(var c=0;c<arguments.length;c++)bm.log("    "+JSON.stringify(arguments[c]));bm.log(")")}if(a=="NavigationString")if((arguments[1]=="left"||arguments[1]=="right"||arguments[1]=="up"||arguments[1]=="down"||arguments[1]=="back"||arguments[1]=="activate")&&!M){for(var l=arguments[1],c=0;c<f.length;c++){arguments[1]=l+"Down";try{f[c].apply(bm,arguments)}catch(k){console.log("UnhandledException ("+
k+") in "+bmHooks[j]+" Callback")}arguments[1]=l+"Clicked";try{f[c].apply(bm,arguments)}catch(m){console.log("UnhandledException ("+m+") in "+bmHooks[j]+" Callback")}}arguments[1]=l+"Up"}else M=true;for(c=0;c<f.length;c++)try{f[c].apply(bm,arguments)}catch(q){console.log("UnhandledException ("+q+") in "+bmHooks[j]+" Callback")}}}function E(){function a(a){var c=document.createElement("div");c.id="brassmonkey-swf-wrapper";document.body.appendChild(c);c=bm.options.name;a=typeof bm.options.design=="string"?
bm.options.design:encodeURIComponent(G(bm.options.design,a));a={bmDeviceName:c,wmode:"transparent",debug:"true",bmControllerXML:a};window.parent.passingObj!==void 0&&window.parent.passingObj.appId!==void 0&&window.parent.passingObj.portalId!==void 0?(a.bmDeviceId=window.parent.passingObj.appId,a.bmPortalId=window.parent.passingObj.portalId):a.bmDeviceId=Math.floor(Math.random()*281474943156225).toString(16);bm.deviceId=a.bmDeviceId;swfobject.embedSWF(bm.options.swfURL,"brassmonkey-swf-wrapper","1",
"1","9.0.124","",a,{quality:"high",bgcolor:"#ffffff",allowscriptaccess:"always",allowfullscreen:"true"},{id:"brassmonkey",name:"Play Brass Monkey",align:"middle",style:"float:left;z-index:-1;position:absolute;margin-top:-1px;"},function(a){a.success===false&&(play.detectiOS()||$(".flash-required").fadeIn())})}if(typeof bm.options.design=="string")a([]);else if(bm.options.design.images.length==0)a([]);else for(var g=0,f=Array(bm.options.design.images.length),c=0;c<bm.options.design.images.length;c++)(function(){var l=
c,k=new Image;k.onload=function(){var c;c=document.createElement("canvas");var q=c.getContext("2d");c.width=k.width;c.height=k.height;q.drawImage(k,0,0);c=c.toDataURL().replace("data:image/png;base64,","");f[l]=c;g++;g==bm.options.design.images.length&&a(f)};k.src=bm.options.design.images[c]})()}function F(a){a/=bm.options.design.orientation=="portrait"?320:480;return a}function K(a){a/=bm.options.design.orientation=="portrait"?480:320;return a}function G(a,g){var f='<?xml version="1.0" encoding="utf-8"?>\n<BMApplicationScheme version="0.1" orientation="'+
a.orientation+'" touchEnabled="'+(a.touchEnabled?"yes":"no")+'" accelerometerEnabled="'+(a.accelerometerEnabled?"yes":"no")+'">\n';if(g.length!=0){f+="<Resources>\n";for(var c=0;c<g.length;c++)f+='<Resource id="'+(c+1)+'" type="image">\n',f+="<data><![CDATA["+g[c]+"]]\></data>\n",f+="</Resource>\n";f+="</Resources>\n"}else f+="<Resources/>\n";if(a.layout.length!=0){f+="<Layout>\n";for(c=0;c<a.layout.length;c++){var k=a.layout[c].handler;a.layout[c].type=="image"&&(k="nullHandler");f+='<DisplayObject type="'+
a.layout[c].type+'" top="'+K(a.layout[c].y)+'" left="'+F(a.layout[c].x)+'" width="'+F(a.layout[c].width)+'" height="'+K(a.layout[c].height)+'" functionHandler="'+k+'">\n';a.layout[c].type=="image"?f+='<Asset name="up" resourceRef="'+(a.layout[c].image+1)+'" />\n':(f+='<Asset name="up" resourceRef="'+(a.layout[c].imageUp+1)+'" />\n',f+='<Asset name="down" resourceRef="'+(a.layout[c].imageDown+1)+'" />\n');f+="</DisplayObject>\n"}f+="</Layout>\n"}else f+="<Layout/>\n";f+="</BMApplicationScheme>";return f}
bm={version:"0.1.0"};window.swfobject===void 0&&brassmonkeySwfObject();bm.init=function(a){bm.options=a;bm.options.logging=a.logging?a.logging:false;bm.options.swfURL=a.swfURL?a.swfURL:"https://s3.amazonaws.com/files.playbrassmonkey.com/sdks/js/v"+bm.version.replace(/\./g,"-")+"/brassmonkey.swf";bm.options.design.images=a.design.images?a.design.images:[];bm.options.design.layout=a.design.layout?a.design.layout:[]};for(var H="#ff6600,#ffcc00,#ff3399,#ff0066,#cc00ff,#999900,#9999cc,#00cc99,#287200,#00ccff,#003366,#99ff00,#cc0000,#80cd68,#6600ff".split(","),
x="DeviceAvailable,DeviceConnected,DeviceDisconnected,NavigationString,KeyString,Invocation,ShakeReceived,AccelReceived,Log,ShowSlot".split(","),w=0;w<x.length;w++)q(x[w],x[w]!="AccelReceived"&&x[w]!="Log");bm.log=function(a){if(bm.options.logging)bm.onLogInternal(a)};var M=false;bm.showSlotInternal=function(a){bm.onShowSlotInternal(H[a-1])};var k=[];bm.getControllerSlot=function(a){for(var g=0;g<k.length;g++)if(k[g]==a)return g};bm.getControllerCount=function(){for(var a=0,g=0;g<k.length;g++)k[g]!==
void 0&&a++;return a};bm.getControllers=function(){for(var a=[],g=0;g<k.length;g++)k[g]!==void 0&&a.push(k[g]);return a};var y={};bm.getDeviceName=function(a){return y[a]};bm.onDeviceConnected(function(a){y[a.deviceId]=a.deviceName;for(var g=0;g<k.length;g++)if(k[g]===void 0){k[g]=a.deviceId;return}k.push(a.deviceId)});bm.onDeviceDisconnected(function(a){delete y[a.deviceId];for(var g=0;g<k.length;g++)if(k[g]==a.deviceId){k[g]=void 0;break}bm.getControllerCount()});bm.isDeviceConnected=function(a){return y[a.deviceId]==
void 0?false:true};var C=[];bm.onTouchesReceived=function(a){C.push(a)};bm.onTouchesReceivedInternal=function(a){for(var g=0;g<a.touches.length;g++)for(var f=a.touches[g],c=0;c<C.length;c++)C[c](f,a.deviceId)};bm.onSocketReady=function(){};bm.setNavMode=function(){document.getElementById("brassmonkey")&&document.getElementById("brassmonkey").SetNavMode!==void 0&&document.getElementById("brassmonkey").SetNavMode()};bm.setKeyboardMode=function(){document.getElementById("brassmonkey")&&document.getElementById("brassmonkey").SetKeyboardMode!==
void 0&&document.getElementById("brassmonkey").SetKeyboardMode()};bm.setGamepadMode=function(){document.getElementById("brassmonkey")&&document.getElementById("brassmonkey").SetGamepadMode!==void 0&&document.getElementById("brassmonkey").SetGamepadMode()};bm.setVisibility=function(a){document.getElementById("brassmonkey")&&document.getElementById("brassmonkey").SetVisibility!==void 0&&document.getElementById("brassmonkey").SetVisibility(a,true)};bm.enableAccelerometer=function(a,g,f){setTimeout(function(){document.getElementById("brassmonkey").EnableAccelerometer(a,
g,f)},2E3)};bm.enableTouch=function(a,g,f){setTimeout(function(){document.getElementById("brassmonkey").EnableTouch(a,g,f)},2E3)};bm.getWidth=function(){return window.parent.passingObj!==void 0&&window.parent.passingObj.width!==void 0?window.parent.passingObj.width:-1};bm.getHeight=function(){return window.parent.passingObj!==void 0&&window.parent.passingObj.height!==void 0?window.parent.passingObj.height:-1};bm.getFullscreen=function(){return window.parent.passingObj!==void 0&&window.parent.passingObj.fullScreen!==
void 0?window.parent.passingObj.fullScreen:false};window.addEventListener?window.addEventListener("DOMContentLoaded",E,false):window.attachEvent("onload",E)})();
