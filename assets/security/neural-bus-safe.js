/** @crisiscore-hardened: SafeNeuralBus with epoch rate limiting */
export const SafeNeuralBus = (() => {
  const counts=new Map(); const MAX=15;
  const epoch=()=>{ try{ return window?.voidBloom?.epoch?.current?.()||'unknown'; }catch{ return 'unknown'; } };
  const deepFreeze=(o)=>{ if(!o||typeof o!=='object')return o; Object.freeze(o);
    for(const k of Object.keys(o)) deepFreeze(o[k]); return o; };
  return Object.freeze({
    publish:(name,payload)=>{
      const e=epoch(); const last=counts.get('__last'); if(e!==last){ counts.clear(); counts.set('__last',e); }
      const key=`${name}:${e}`; const n=(counts.get(key)||0)+1; counts.set(key,n);
      if(n>MAX){ console.error(`NeuralBus cascade prevented: ${name} in ${e}`); return false; }
      const safe=payload?deepFreeze(JSON.parse(JSON.stringify(payload))):undefined;
      return window.NeuralBus?.publish?.(name,safe);
    },
    subscribe:(name,cb)=> window.NeuralBus?.subscribe?.(name,(d)=>cb(d?JSON.parse(JSON.stringify(d)):d)),
    getEventCounts:()=>Object.freeze(Object.fromEntries(counts))
  });
})();
