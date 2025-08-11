#!/bin/bash
# CrisisCore-Auditor++ Pain Tracker Hardening
# Corrected to disable history expansion that causes errors with '!'
set -euo pipefail
set +H

# Bootstrap helpers
cat > cc.sh <<'SH'
set -euo pipefail
b(){ [ -f "$1" ]&&cp -n "$1" "$1.bak"||true; }
r(){ b "$1"; perl -0777 -pe "$2" -i "$1"; }
ia(){ b "$1"; awk -v a="$2" -v b="$3" 'BEGIN{RS="";ORS=""}{if($0~a){sub(a,sprintf("%s\n%s",a,b))}print}' "$1">"$1.tmp"&&mv "$1.tmp" "$1"; }
add(){ [ -f "$1" ]&&echo "skip: $1 already exists"||printf "%s\n" "$2" > "$1"; }
commit(){ git add -A && git commit -m "CrisisCore: $*"; }
SH
chmod +x cc.sh; . ./cc.sh

echo "--- 1. Securing API key via backend proxy ---"
mkdir -p scripts
add scripts/api-proxy.js "const express=require('express');const{createProxyMiddleware}=require('http-proxy-middleware');const rateLimit=require('express-rate-limit');const app=express();app.use(rateLimit({windowMs:15*60*1000,max:100}));app.use('/api/wcb',createProxyMiddleware({target:process.env.WCB_API_ENDPOINT,changeOrigin:true,pathRewrite:{'^/api/wcb':''},onProxyReq:r=>r.setHeader('Authorization',\`Bearer \${process.env.WCB_API_KEY}\`)}));app.listen(process.env.PORT||3001,()=>console.log('WCB API proxy running'));"
r .env.example 's/VITE_WCB_API_KEY=.*/# API key secured in backend proxy\n# WCB_API_KEY=your_wcb_api_key_here/'
r .github/workflows/pages.yml 's/VITE_WCB_API_ENDPOINT: .*/VITE_WCB_API_ENDPOINT: \/api\/wcb/'
commit "secure WCB API key via backend proxy"

echo "--- 2. Adding API circuit breaker ---"
mkdir -p src/lib
add src/lib/circuit-breaker.ts "export class CircuitBreaker{private f=0;private l=0;private s:'CLOSED'|'OPEN'|'HALF-OPEN'='CLOSED';constructor(private t=3,private r=30000){}get isOpen(){const n=Date.now();if(this.s==='OPEN'&&n-this.l>this.r){this.s='HALF-OPEN';this.f=Math.max(0,this.t-1)}return this.s==='OPEN'}success(){this.f=0;this.s='CLOSED'}failure(){this.f++;this.l=Date.now();if(this.f>=this.t)this.s='OPEN'}}export const wcbBreaker=new CircuitBreaker();"
add src/lib/api-client.ts "import{wcbBreaker}from'./circuit-breaker';export async function wcbSubmit(data:any){if(wcbBreaker.isOpen)throw new Error('Circuit breaker open: Too many API failures');try{const r=await fetch('/api/wcb/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok){wcbBreaker.failure();throw new Error(\`WCB API error: \${r.status}\`)}wcbBreaker.success();return r.json()}catch(e){wcbBreaker.failure();throw e}}"
commit "add WCB API circuit breaker"

echo "--- 3. Adding pain data validation ---"
add src/lib/validation.ts "const req=(v:any,msg:string)=>{if(!v)throw new Error(msg);return v};export const validatePain=(d:any)=>{const{intensity,location,description,timestamp}=d;req(intensity>=0&&intensity<=10,'Pain intensity must be 0-10');req(location?.length>=1&&location?.length<=100,'Location required (1-100 chars)');req(description?.length>=1&&description?.length<=500,'Description required (1-500 chars)');req(timestamp&&new Date(timestamp).getTime(),'Valid timestamp required');return{intensity:+intensity,location:String(location).trim(),description:String(description).trim(),timestamp:new Date(timestamp).toISOString()}};"
add src/lib/submit.ts "import{validatePain}from'./validation';import{wcbSubmit}from'./api-client';export async function submitPain(raw:any){try{const valid=validatePain(raw);await wcbSubmit(valid);return{success:true}}catch(e:any){return{success:false,error:e.message}}}"
commit "add pain data validation"

echo "--- 4. Adding React error boundaries ---"
mkdir -p src/components
add src/components/ErrorBoundary.tsx "import React,{Component,ErrorInfo,ReactNode}from'react';interface Props{children:ReactNode;fallback?:ReactNode}interface State{hasError:boolean;error?:Error}export class ErrorBoundary extends Component<Props,State>{constructor(props:Props){super(props);this.state={hasError:false}}static getDerivedStateFromError(error:Error):State{return{hasError:true,error}}componentDidCatch(error:Error,errorInfo:ErrorInfo){console.error('ErrorBoundary:',error,errorInfo);if((window as any).Sentry)(window as any).Sentry.captureException(error)}render():ReactNode{if(this.state.hasError){return this.props.fallback||<div className='error-boundary'><h2>Something went wrong</h2><p>Please try refreshing the page</p><button onClick={()=>window.location.reload()}>Refresh</button></div>}return this.props.children}}"
commit "add React error boundaries"

echo "--- 5. Adding environment validation ---"
add src/lib/env.ts "const required=['VITE_WCB_API_ENDPOINT'];const missing=required.filter(k=>!import.meta.env[k]);if(missing.length){const msg=\`Missing env vars: \${missing.join(', ')}\`;console.error(msg);const root=document?.getElementById?.('root');if(root)root.innerHTML=\`<div style='padding:20px;color:red'><h1>Config Error</h1><p>\${msg}</p></div>\`;throw new Error(msg)}export const env={WCB_ENDPOINT:import.meta.env.VITE_WCB_API_ENDPOINT,SENTRY_DSN:import.meta.env.VITE_SENTRY_DSN,APP_ENV:import.meta.env.VITE_APP_ENVIRONMENT||'development'};"
commit "add environment validation"

# Note: The original script had a 'vector-scan' part for a pre-commit hook.
# It has been omitted here for simplicity, as it relies on a .husky setup that may not exist.
# If you use husky, you can manually add 'node scripts/vector-scan.js' to your pre-commit hook.

echo "✅ CrisisCore hardening complete"
echo
echo "Next steps for development:"
echo "1. Install backend dependencies: npm install express http-proxy-middleware express-rate-limit"
echo "2. Run the proxy server: node scripts/api-proxy.js"
echo "3. Run your front-end development server as usual."
