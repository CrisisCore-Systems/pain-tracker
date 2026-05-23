const { execFile } = require('node:child_process');
const https = require('node:https');

const DEFAULT_ENDPOINT = 'https://gql.hashnode.com/';

function getEndpoint() {
  return String(process.env.HASHNODE_GRAPHQL_URL || DEFAULT_ENDPOINT).trim() || DEFAULT_ENDPOINT;
}

function getTransport() {
  return String(process.env.HASHNODE_TRANSPORT || 'node').trim().toLowerCase();
}

function isInsecureTlsEnabled() {
  return /^1|true|yes$/i.test(String(process.env.HASHNODE_INSECURE_TLS || '').trim());
}

function buildNetworkHelp(reason) {
  return (
    `${reason} ` +
    `Set HASHNODE_GRAPHQL_URL to a reachable Hashnode GraphQL gateway if your network requires one. ` +
    `You can also try HASHNODE_TRANSPORT=powershell if PowerShell uses a different network path. ` +
    `Use HASHNODE_INSECURE_TLS=true only for a trusted internal proxy.`
  );
}

function parseJsonOrThrow(raw, { endpoint, transport, statusCode }) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    const trimmed = String(raw || '').trim();
    if (/<!doctype html>|<html|405 Method Not Allowed|Invoke-WebRequest\s*:/i.test(trimmed)) {
      throw new Error(
        buildNetworkHelp(
          `Hashnode GraphQL request via ${transport} returned HTML instead of JSON from ${endpoint} (status ${statusCode || 'unknown'}).`,
        ),
      );
    }

    throw new Error(
      `Failed to parse GraphQL response from ${endpoint} via ${transport}: ${err.message}`,
    );
  }
}

function requestViaNode({ endpoint, headers, body }) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(body),
        },
        rejectUnauthorized: !isInsecureTlsEnabled(),
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, raw: data });
        });
      },
    );

    req.on('error', (err) => {
      if (err && (err.code === 'ERR_TLS_CERT_ALTNAME_INVALID' || /trust relationship|certificate/i.test(err.message))) {
        reject(new Error(buildNetworkHelp(`TLS verification failed while reaching ${endpoint}.`)));
        return;
      }

      reject(err);
    });

    req.write(body);
    req.end();
  });
}

function requestViaPowerShell({ endpoint, token, body }) {
  return new Promise((resolve, reject) => {
    const tokenB64 = Buffer.from(String(token || ''), 'utf8').toString('base64');
    const bodyB64 = Buffer.from(body, 'utf8').toString('base64');
    const escapedEndpoint = endpoint.replace(/'/g, "''");
    const allowInsecureTls = isInsecureTlsEnabled();

    const command = [
      "$ErrorActionPreference = 'Stop'",
      allowInsecureTls
        ? "[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }"
        : null,
      `$token = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${tokenB64}'))`,
      `$body = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${bodyB64}'))`,
      "$headers = @{ Authorization = $token }",
      'try {',
      `  $response = Invoke-WebRequest -Uri '${escapedEndpoint}' -Method Post -Headers $headers -ContentType 'application/json' -Body $body -UseBasicParsing`,
      "  [Console]::Out.Write($response.Content)",
      '} catch {',
      '  if ($_.Exception.Response) {',
      '    try {',
      '      $stream = $_.Exception.Response.GetResponseStream()',
      '      if ($stream) {',
      '        $reader = New-Object System.IO.StreamReader($stream)',
      '        $content = $reader.ReadToEnd()',
      '        if ($content) {',
      '          [Console]::Out.Write($content)',
      '          exit 0',
      '        }',
      '      }',
      '    } catch {}',
      '  }',
      '  throw',
      '}',
    ].filter(Boolean).join('; ');

    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', command],
      { maxBuffer: 1024 * 1024 * 5 },
      (error, stdout, stderr) => {
        const combined = `${stdout || ''}\n${stderr || ''}`.trim();

        if (error) {
          if (/<!doctype html>|<html|405 Method Not Allowed/i.test(combined)) {
            resolve({ statusCode: null, raw: combined });
            return;
          }

          reject(new Error(combined || error.message));
          return;
        }

        resolve({ statusCode: null, raw: stdout });
      },
    );
  });
}

async function gqlRequest(query, variables, token) {
  const endpoint = getEndpoint();
  const transport = getTransport();
  const body = JSON.stringify({ query, variables });

  const headers = {
    Authorization: token,
    'Content-Type': 'application/json',
  };

  let response;
  if (transport === 'powershell') {
    response = await requestViaPowerShell({ endpoint, token, body });
  } else if (transport === 'node') {
    response = await requestViaNode({ endpoint, headers, body });
  } else {
    throw new Error(`Unsupported HASHNODE_TRANSPORT: ${transport}`);
  }

  return parseJsonOrThrow(response.raw, {
    endpoint,
    transport,
    statusCode: response.statusCode,
  });
}

module.exports = {
  gqlRequest,
  getEndpoint,
  getTransport,
};