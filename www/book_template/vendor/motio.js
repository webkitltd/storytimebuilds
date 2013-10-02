/*! Motio 2.2.0 - 11th Apr 2013 | https://github.com/Darsain/motio */
(function(p){function x(j,n){function G(c){b.reversed=c;s||(a.isPaused=0,C("play"),D())}function u(){v=0;E=y?Math.round(g.x)+"px "+Math.round(g.y)+"px":q[h];E!==H&&(j.style.backgroundPosition=H=E);C("frame");b.finite&&b.to===h&&(a.pause(),"function"===l(b.callback)&&b.callback.call(a))}function D(){b.finite&&b.to===h||(y?(g.x+=d.speedX/d.fps,g.y+=d.speedY/d.fps,d.bgWidth&&Math.abs(g.x)>d.bgWidth&&(g.x%=d.bgWidth),d.bgHeight&&Math.abs(g.y)>d.bgHeight&&(g.y%=d.bgHeight)):(b.finite?h=b.immediate?b.to:
h+(h>b.to?-1:1):b.reversed?0>=--h&&(h=q.length-1):++h>=q.length&&(h=0),a.frame=h),b.immediate||(s=60<=d.fps?z(D):setTimeout(D,1E3/d.fps)),v||(v=z(u)))}function w(a,f){r=0;for(A=m[a].length;r<A;r++)if(m[a][r]===f)return r;return-1}function C(c,f){if(m[c]){r=0;for(A=m[c].length;r<A;r++)m[c][r].call(a,c,f)}}function F(a){return p.getComputedStyle?p.getComputedStyle(j,null)[a]:j.currentStyle[a]}var d,k=n,I={},k="object"===l(k)?k:{},B;for(B in x.defaults)I[B]=(k.hasOwnProperty(B)?k:x.defaults)[B];d=I;
var a=this,y=!d.frames,q=[],m={},b={},h=0,g,E,H,s,v,r,A;a.element=j;a.width=d.width||j.clientWidth;a.height=d.height||j.clientHeight;a.options=d;a.isPaused=1;a.pause=function(){s&&(a.isPaused=1,t(s),s=clearTimeout(s),v=t(v),C("pause"));return a};a.play=function(c){b.finite=0;b.callback=0;b.immediate=0;G(c);return a};a.toggle=function(){a[s?"pause":"play"]();return a};a.toStart=function(c,f){return a.to(0,c,f)};a.toEnd=function(c,f){return a.to(q.length-1,c,f)};a.to=function(c,f,e){if(y||isNaN(parseFloat(c))||
!isFinite(c)||0>c||c>=q.length)return a;"function"===l(f)&&(e=f,f=!1);if(c===h)if(0===c)h=q.length;else if(c===q.length-1)h=-1;else return"function"===l(e)&&e.call(a),a.pause(),a;b.finite=1;b.to=c;b.immediate=f;b.callback=e;G();return a};a.set=function(c,f){d[c]=f;return a};a.on=function(c,f){if("object"===l(c))for(var e in c){if(c.hasOwnProperty(e))a.on(e,c[e])}else if("function"===l(f)){e=c.split(" ");for(var b=0,d=e.length;b<d;b++)m[e[b]]=m[e[b]]||[],-1===w(e[b],f)&&m[e[b]].push(f)}else if("array"===
l(f)){e=0;for(b=f.length;e<b;e++)a.on(c,f[e])}return a};a.off=function(c,b){if(b instanceof Array)for(var e=0,d=b.length;e<d;e++)a.off(c,b[e]);else for(var e=c.split(" "),d=0,g=e.length;d<g;d++)if(m[e[d]]=m[e[d]]||[],"undefined"===l(b))m[e[d]].length=0;else{var h=w(e[d],b);-1!==h&&m[e[d]].splice(h,1)}return a};a.destroy=function(){a.pause();j.style.backgroundPosition="";return a};k=(F("backgroundPosition")||F("backgroundPositionX")+" "+F("backgroundPositionY")).replace(/left|top/gi,0).split(" ");
g={x:0|parseInt(k[0],10),y:0|parseInt(k[1],10)};if(y)a.pos=g;else{for(k=q.length=0;k<d.frames;k++)d.vertical?g.y=k*-a.height:g.x=k*-a.width,q.push(g.x+"px "+g.y+"px");a.frames=q.length;a.frame=0}}function l(j){return Object.prototype.toString.call(j).match(/\s([a-z]+)/i)[1].toLowerCase()}for(var t=p.cancelAnimationFrame||p.cancelRequestAnimationFrame,z=p.requestAnimationFrame,u=["moz","webkit","o"],w=0,n=0,J=u.length;n<J&&!t;++n)z=(t=p[u[n]+"CancelAnimationFrame"]||p[u[n]+"CancelRequestAnimationFrame"])&&
p[u[n]+"RequestAnimationFrame"];t||(z=function(j){var l=+new Date,n=Math.max(0,16-(l-w));w=l+n;return p.setTimeout(function(){j(l+n)},n)},t=function(j){clearTimeout(j)});p.Motio=x;x.defaults={fps:15,frames:0,vertical:0,width:0,height:0,speedX:0,speedY:0,bgWidth:0,bgHeight:0}})(window);