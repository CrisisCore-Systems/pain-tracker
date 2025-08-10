const req=["VITE_APP_TITLE","VITE_APP_ENVIRONMENT","VITE_SENTRY_DSN","VITE_WCB_API_ENDPOINT"];
const miss=req.filter(k=>!(k in process.env));
if(miss.length){console.error("Missing env:",miss.join(", "));process.exit(1);}
