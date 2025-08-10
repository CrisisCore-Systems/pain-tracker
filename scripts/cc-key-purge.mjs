import fs from 'fs'; import path from 'path';

const log=(...a)=>console.log('[cc-key-purge]',...a);
const tryRead = (p)=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):null;
const write = (p,s)=>{ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,s); };

let changed = [];

// 0) env.d.ts: drop VITE_WCB_API_KEY
{
  const p='src/env.d.ts'; const s=tryRead(p);
  if(s){
    const out = s.replace(/^\s*readonly\s+VITE_WCB_API_KEY:.*\n?/m,'');
    if(out!==s){ write(p,out); changed.push(p); log('cleaned',p); }
  }
}

// 1) .env.example: comment out client key
{
  const p='.env.example'; const s=tryRead(p);
  if(s){
    const out = s.replace(/^VITE_WCB_API_KEY=.*$/m,'# moved to backend proxy (WCB_API_KEY)');
    if(out!==s){ write(p,out); changed.push(p); log('updated',p); }
  }
}

// Utilities
const exts = new Set(['.ts','.tsx','.js','.jsx']);
function glob(dir){
  const out=[]; if(!fs.existsSync(dir)) return out;
  (function walk(d){
    for(const f of fs.readdirSync(d)){
      const p=path.join(d,f), st=fs.statSync(p);
      if(st.isDirectory()) walk(p);
      else if(exts.has(path.extname(f))) out.push(p);
    }
  })(dir); return out;
}
const files=[...glob('src')];

// 2) Transform source files
for(const p of files){
  let s=tryRead(p); const o=s; if(!s) continue;

  // a) process.env.VITE_WCB_API_KEY → undefined (proxy injects auth)
  s = s.replace(/process\.env\.VITE_WCB_API_KEY/g, 'undefined /* proxy-auth */');

  // b) Remove Authorization header built from any apiKey variable
  //    Handles forms like: Authorization: `Bearer ${apiKey}` or "..."+apiKey
  s = s.replace(/([,{]\s*)['"]Authorization['"]\s*:\s*[^,}\n]+,?\s*/g, '$1// Authorization moved to proxy\n');

  // c) fetch using VITE_WCB_API_ENDPOINT → wcbApiRequest
  //    fetch(`${import.meta.env.VITE_WCB_API_ENDPOINT}/x`, → wcbApiRequest('/x',
  s = s.replace(/fetch\(\s*`?\$\{import\.meta\.env\.VITE_WCB_API_ENDPOINT\}([^`"'()]+)`?\s*,/g,
                 (_m,rest)=>`wcbApiRequest(\`${rest.trim()}\`,`);
  //    fetch(import.meta.env.VITE_WCB_API_ENDPOINT + '/x', → wcbApiRequest('/x',
  s = s.replace(/fetch\(\s*import\.meta\.env\.VITE_WCB_API_ENDPOINT\s*\+\s*(['"`][^'"`]+['"`])\s*,/g,
                 (_m,lit)=>`wcbApiRequest(${lit},`);
  //    fetch(import.meta.env.VITE_WCB_API_ENDPOINT, → wcbApiRequest('/', ...
  s = s.replace(/fetch\(\s*import\.meta\.env\.VITE_WCB_API_ENDPOINT\s*,/g, 'wcbApiRequest("/",');

  // If we introduced wcbApiRequest, ensure import path is correct for this file
  if (/wcbApiRequest\(/.test(s) && !/from ['"].*utils\/api-client/.test(s)) {
    // compute relative path to src/utils/api-client.(ts|js) without extension
    const ext = fs.existsSync('tsconfig.json') || files.some(f=>f.endsWith('.ts')||f.endsWith('.tsx')) ? 'ts' : 'js';
    const target = path.relative(path.dirname(p), path.join('src','utils',`api-client.${ext}`)).replace(/\\/g,'/');
    const importPath = target.replace(/\.(ts|js)$/, '');
    s = `import { wcbApiRequest } from '${importPath.startsWith('.')?importPath:'./'+importPath}';\n` + s;
  }

  if(s!==o){ write(p,s); changed.push(p); log('patched',p); }
}

console.log(JSON.stringify({changed},null,2));
