(this.webpackJsonpwebreact=this.webpackJsonpwebreact||[]).push([[0],{36:function(t,e,n){},37:function(t,e,n){},45:function(t,e,n){"use strict";n.r(e);var r=n(6),c=n(0),a=n.n(c),i=n(12),s=n.n(i),o=(n(36),n(37),n(4)),u=n.n(o),f=n(11),p=n(19),h=n(61),l=n(64),b=n(63),d=n(28),g=n.n(d),j="BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8";function m(){return v.apply(this,arguments)}function v(){return(v=Object(f.a)(u.a.mark((function t(){return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Notification.requestPermission();case 2:return t.abrupt("return",t.sent);case 3:case"end":return t.stop()}}),t)})))).apply(this,arguments)}function x(){return O.apply(this,arguments)}function O(){return(O=Object(f.a)(u.a.mark((function t(){var e;return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,navigator.serviceWorker.ready;case 2:return e=t.sent,t.next=5,e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:j});case 5:return t.abrupt("return",t.sent);case 6:case"end":return t.stop()}}),t)})))).apply(this,arguments)}function y(){return navigator.serviceWorker.ready.then((function(t){return t.pushManager.getSubscription()})).then((function(t){return t}))}var k="https://ata-push-api.herokuapp.com";function w(t){return fetch("".concat(k).concat(t),{credentials:"omit",headers:{"content-type":"application/json;charset=UTF-8","sec-fetch-mode":"cors"},method:"GET",mode:"cors"}).then((function(t){return t.json()})).then((function(t){return t}))}var S=Object(h.a)((function(t){return{rightIcon:{marginLeft:t.spacing(1)},leftIcon:{marginRight:t.spacing(1)}}}));function I(t){var e=S(),n=Object(c.useState)(!1),a=Object(p.a)(n,2),i=a[0],s=a[1],o=Object(c.useState)(!1),h=Object(p.a)(o,2),d=h[0],j=h[1],v=function(){var t=Object(f.a)(u.a.mark((function t(){var e;return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,y();case 2:if(t.t0=t.sent,t.t0){t.next=7;break}return t.next=6,x();case 6:t.t0=t.sent;case 7:e=t.t0,console.log(e),(n="/subscription/create",r=e,fetch("".concat(k).concat(n),{credentials:"omit",headers:{"content-type":"application/json;charset=UTF-8","sec-fetch-mode":"cors"},body:JSON.stringify(r),method:"POST",mode:"cors"}).then((function(t){return t.json()})).then((function(t){return t}))).then((function(t){localStorage.setItem("subscriptionId",t.id),j(!1),s(!0)})).catch((function(t){console.log(t),j(!1),s(!1)}));case 10:case"end":return t.stop()}var n,r}),t)})));return function(){return t.apply(this,arguments)}}(),O=function(){var t=Object(f.a)(u.a.mark((function t(){return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return s(!0),j(!0),t.next=4,m();case 4:"granted"!==t.sent?(alert("You denied the consent to receive notifications.\n                  Please allow notification at \n                  chrome://settings/content/siteDetails?site=<domain>"),s(!1),j(!1)):v();case 6:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}();return Object(c.useEffect)((function(){if("serviceWorker"in navigator&&"PushManager"in window){function t(){return(t=Object(f.a)(u.a.mark((function t(){return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return s(!0),j(!0),t.next=4,y();case 4:if(!t.sent){t.next=8;break}t.t0=!0,t.next=9;break;case 8:t.t0=!1;case 9:if(t.t0){t.next=14;break}return s(!1),j(!1),t.abrupt("return");case 14:w("/subscription/check/"+localStorage.getItem("subscriptionId")).then((function(t){t.isExisted?s(!0):(s(!1),v()),j(!1)})).catch((function(t){console.log(t),j(!1),s(!1)}));case 15:case"end":return t.stop()}}),t)})))).apply(this,arguments)}navigator.serviceWorker.register("/sw.js"),function(){t.apply(this,arguments)}()}}),[]),Object(r.jsxs)(l.a,{onClick:O,disabled:i,variant:"contained",color:"primary",className:e.leftIcon,children:[t.text||"Notify Attendance",d?Object(r.jsx)(b.a,{size:18,className:e.rightIcon}):Object(r.jsx)(g.a,{className:e.rightIcon})]})}var N=function(){return Object(r.jsx)("div",{className:"App",children:Object(r.jsx)(I,{})})},J=function(t){t&&t instanceof Function&&n.e(3).then(n.bind(null,66)).then((function(e){var n=e.getCLS,r=e.getFID,c=e.getFCP,a=e.getLCP,i=e.getTTFB;n(t),r(t),c(t),a(t),i(t)}))};s.a.render(Object(r.jsx)(a.a.StrictMode,{children:Object(r.jsx)(N,{})}),document.getElementById("root")),J()}},[[45,1,2]]]);
//# sourceMappingURL=main.4e77fc0c.chunk.js.map