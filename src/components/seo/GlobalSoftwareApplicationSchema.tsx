import { useEffect } from 'react';
import { generateSoftwareApplicationSchema, safeJsonLdStringify } from '../../lib/seo';

const SCRIPT_SELECTOR = 'script[data-pt-schema="software-application"]';
const SCHEMA_JSON = safeJsonLdStringify(generateSoftwareApplicationSchema());

export function GlobalSoftwareApplicationSchema() {
  useEffect(() => {
    let script = document.head.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-pt-schema', 'software-application');
      document.head.appendChild(script);
    }

    script.text = SCHEMA_JSON;
  }, []);

  return null;
}
