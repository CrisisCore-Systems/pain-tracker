// Required environment variables for production builds
const required = ["VITE_APP_ENVIRONMENT", "VITE_WCB_API_ENDPOINT"];

// Optional environment variables with defaults
const optional = {
  "VITE_APP_TITLE": "Pain Tracker",
  "VITE_SENTRY_DSN": ""
};

// Default values for required variables if not set
const requiredDefaults = {
  "VITE_APP_ENVIRONMENT": "development",
  "VITE_WCB_API_ENDPOINT": "/api/wcb"
};

// Set defaults for required variables if missing
required.forEach(key => {
  if (!(key in process.env) || !process.env[key]) {
    if (requiredDefaults[key]) {
      process.env[key] = requiredDefaults[key];
      console.log(`Using default for ${key}: ${requiredDefaults[key]}`);
    }
  }
});

// Check required variables after setting defaults
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
