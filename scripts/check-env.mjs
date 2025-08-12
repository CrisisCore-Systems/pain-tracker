// Required environment variables for production builds
const required = ["VITE_APP_ENVIRONMENT", "VITE_WCB_API_ENDPOINT"];

// Optional environment variables with defaults
const optional = {
  "VITE_APP_TITLE": "Pain Tracker",
  "VITE_SENTRY_DSN": ""
};

// Check required variables
const missing = required.filter(k => !(k in process.env) || !process.env[k]);
if (missing.length) {
  console.error("Missing required environment variables:", missing.join(", "));
  process.exit(1);
}

// Set defaults for optional variables
Object.entries(optional).forEach(([key, defaultValue]) => {
  if (!(key in process.env) || !process.env[key]) {
    process.env[key] = defaultValue;
    console.log(`Using default for ${key}: ${defaultValue}`);
  }
});

console.log("Environment validation passed ✓");
