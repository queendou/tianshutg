//订阅地址：https://域名/ID/vless .
import{connect}from'cloudflare:sockets';const config = {
  id: '123456',//ID
  uuid: '173eb8bd-7154-4e20-91ec-dfadaf1f632b',//UUID
  node: 'ns5.cloudflare.com',//节点IP
  enableProxy: true,//反代开关
  proxyIP: 'ProxyIP.US.CMLiussss.net ', //反代:端口
  nodeName: '天书telegram版'  // 节点名称
};
export default{async fetch(a){const b=new URL(a.url),c=a.headers.get('Upgrade');if('websocket'!==c)return b.pathname===`/${config.id}/vless`?new Response(generateVlessConfig(a.headers.get('Host')),{status:200,headers:{'Content-Type':'text/plain;charset=utf-8'}}):new Response('Expected WebSocket',{status:400});const d=decodeBase64(a.headers.get('sec-websocket-protocol'));if(verifyUUID(new Uint8Array(d.slice(1,17)))!==config.uuid)return new Response('Invalid UUID',{status:403});const{tcpSocket:e,initialData:f}=await parseVlessHeader(d);return await upgradeWebSocket(a,e,f);}};async function upgradeWebSocket(a,b,c){const{0:d,1:e}=new WebSocketPair();e.accept();pipeline(e,b,c);return new Response(null,{status:101,webSocket:d});}async function parseVlessHeader(a){const b=new DataView(a),c=new Uint8Array(a),d=c[17],e=b.getUint16(18+d+1),f=c[18+d+3];let g,h=18+d+4;if(1===f)g=Array.from(c.slice(h,h+4)).join('.'),h+=4;else if(2===f){const a=c[h];g=new TextDecoder().decode(c.slice(h+1,h+1+a)),h+=a+1}else{const v=new DataView(a);g=Array(8).fill().map((_,i)=>v.getUint16(h+2*i).toString(16)).join(':'),h+=16;}const i=a.slice(h);let j;async function k(a,b){try{const c=connect({hostname:a,port:b});return await c.opened,c}catch(a){console.error('Connection error:',a);throw a}}try{console.log('Connecting to:',g,e);j=await k(g,e);}catch{const[a,b]=config.proxyIP.split(':');if(!config.enableProxy||!config.proxyIP)throw Error('Connection failed');console.log('Trying proxy:',a,b||e);try{j=await k(a,Number(b)||e);}catch{throw Error('Proxy connection failed');}}return{tcpSocket:j,initialData:i};}async function pipeline(a,b,c){a.send(new Uint8Array([0,0]));const d=b.writable.getWriter(),e=b.readable.getReader();c&&await d.write(c);a.addEventListener('message',a=>d.write(a.data));try{while(1){const{value:b,done:c}=await e.read();if(c)break;b&&a.send(b);}}catch(b){console.error('Error reading TCP:',b);}finally{try{a.close();}catch{}try{await e.cancel();}catch{}try{d.releaseLock();}catch{}try{b.close();}catch{}}}function decodeBase64(a){return Uint8Array.from(atob(a.replace(/-/g,'+').replace(/_/g,'/')),a=>a.charCodeAt(0)).buffer;}function verifyUUID(a){const b=Array.from(a,a=>a.toString(16).padStart(2,'0')).join('');return`${b.slice(0,8)}-${b.slice(8,12)}-${b.slice(12,16)}-${b.slice(16,20)}-${b.slice(20)}`;}function generateVlessConfig(a){const b='/?ed=2560';return`vless://${config.uuid}@${config.node}:443?encryption=none&security=tls&sni=${a}&type=ws&host=${a}&path=${encodeURIComponent(b)}#${encodeURIComponent(config.nodeName)}`;}









