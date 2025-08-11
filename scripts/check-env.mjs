import fs from 'fs';
import path from 'path';

// Simple .env loader
const loadEnv = () => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (e) {
    // .env file is optional
  }
};

loadEnv();

const req=["VITE_WCB_API_ENDPOINT"];
const opt=["VITE_APP_TITLE","VITE_APP_ENVIRONMENT","VITE_SENTRY_DSN"];
const miss=req.filter(k=>!(k in process.env));
const missOpt=opt.filter(k=>!(k in process.env));
if(miss.length){console.error("Missing required env:",miss.join(", "));process.exit(1);}
if(missOpt.length){console.warn("Missing optional env:",missOpt.join(", "));}
