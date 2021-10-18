"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var r,e,n={0:1,2:3,3:1,4:2,6:4},t=!1,o=!1,i=!1,f=[],h=0,d={};function a(n){var t=r+n;if(t>e.length)throw new Error("Unexpectedly reached end of file. Index: "+r);var o=e.slice(r,t);return r=t,o}function u(r,e){var n=w(r,e);return 2147483648&n?-4294967296^n:n}function w(r,e){return r[e]<<24|r[e+1]<<16|r[e+2]<<8|r[e+3]}d[1229472850]=function(e){var o=e[8],i=e[9],f=e[10],d=e[11],a=e[12];if(8!==o&&4!==o&&2!==o&&1!==o&&16!==o)throw new Error("Unsupported bit depth "+o+". Index: "+r);if(!(i in n))throw new Error("Unsupported color type. Index: "+r);if(0!==f)throw new Error("Unsupported compression method. Index: "+r);if(0!==d)throw new Error("Unsupported filter method. Index: "+r);if(0!==a&&1!==a)throw new Error("Unsupported interlace method. Index: "+r);h=i,t=!0},d[1229278788]=function(){i=!0},d[1229209940]=function(e){if(3===h&&0===f.length)throw new Error("Expected palette not found. Index: "+r);o=!0},d[1347179589]=function(r){for(var e=Math.floor(r.byteLength/3),n=0;n<e;n++)f.push([r[3*n],r[3*n+1],r[3*n+2],255])},d[1951551059]=function(e){if(3===h){if(0===f.length)throw new Error("Transparency chunk must be after palette. Index: "+r);if(e.byteLength>f.length)throw new Error("More transparent colors than palette size. Index: "+r);for(var n=0;n<e.byteLength;n++)f[n][3]=e[n]}},d[1732332865]=function(){};var c=[];function l(r){for(var e=-1,n=0;n<r.length;n++)e=c[255&(e^r[n])]^e>>>8;return-1^e}!function(){for(var r=0;r<256;r++){for(var e=r,n=0;n<8;n++)1&e?e=3988292384^e>>>1:e>>>=1;c[r]=e}}(),exports.pngValidator=function(n){for(t=!1,o=!1,i=!1,f=[],h=0,r=0,e=n,function(){for(var e=[137,80,78,71,13,10,26,10],n=a(e.length),t=0;t<e.length;t++)if(n[t]!==e[t])throw new Error("Invalid file signature. Index: "+r)}();r<e.byteLength;){var c=w(e,r);if(r+=4,c>e.byteLength-r)throw new Error("Invalid chunk length. Index: "+r);var p=e.slice(r,r+4+c),s=w(e,r);r+=4;for(var g="",I=4;I>0;I--)g+=String.fromCharCode(e[r-I]);var x=Boolean(32&p[0]);if(!t&&1229472850!==s)throw new Error("Expected IHDR on beggining. Index: "+r);var v=a(c),E=d[s];if(null==E){if(!x)throw new Error("Unsupported critical chunk type "+g+". Index: "+r);r+=4}else{E(v);var y=u(e,r);r+=4;var b=l(p);if(b!==y)throw new Error("Crc error - "+y+" - "+b+". Index: "+r)}}if(!t)throw new Error("Parsing ended without finding the IHDR chunk. Index: "+r);if(!o)throw new Error("Parsing ended without finding any IDAT chunk. Index: "+r);if(!i)throw new Error("Parsing ended without finding the IEND chunk. Index: "+r);if(n.byteLength>r)throw new Error("There are bytes left at the end of the file. Index: "+r)};
