const endpoint = 'https://gql.hashnode.com/';

import 'dotenv/config';

async function main() {
  const tokenFrom = process.env.HASHNODE_TOKEN
    ? 'HASHNODE_TOKEN'
    : process.env.HASHNODE_API_KEY
      ? 'HASHNODE_API_KEY'
      : null;
  const token = process.env.HASHNODE_TOKEN ?? process.env.HASHNODE_API_KEY;

  if (process.env.HASHNODE_TOKEN && process.env.HASHNODE_API_KEY) {
    console.log(
      'Both HASHNODE_TOKEN and HASHNODE_API_KEY are set. HASHNODE_TOKEN will be used.',
    );
    console.log(
      'If you updated .env but still see old behavior, unset HASHNODE_TOKEN in this terminal (or open a new terminal).',
    );
    console.log('PowerShell: Remove-Item Env:HASHNODE_TOKEN');
  }

  if (!token) {
    console.log('No Hashnode token found in env.');
    console.log('Set one of: HASHNODE_TOKEN or HASHNODE_API_KEY');
    process.exit(1);
  }

  const trimmedToken = token.trim();
  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      trimmedToken,
    );

  console.log(`Using ${tokenFrom} (length ${trimmedToken.length}).`);
  if (looksLikeUuid) {
    console.log(
      'Note: this value looks like a UUID. Hashnode API tokens are usually not UUIDs; ' +
        'you likely need a Personal Access Token from https://hashnode.com/settings/developer',
    );
  }
  const query = '{ me { id username name publications(first: 20) { edges { node { id title url domainInfo { hashnodeSubdomain domain { host ready } wwwPrefixedDomain { host ready } } } } } } }';

  async function tryRequest(authorizationValue, label) {
    const headers = {
      'content-type': 'application/json',
      Authorization: authorizationValue,
      // Some Hashnode setups accept this header; harmless if ignored.
      'x-hashnode-access-token': trimmedToken,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    const payload = await response.json();
    const unauth = payload?.errors?.some((e) => e?.extensions?.code === 'UNAUTHENTICATED');

    console.log(`\nAuth attempt: ${label}`);
    console.log('HTTP', response.status);
    console.log(JSON.stringify(payload, null, 2));

    return { payload, unauth };
  }

  // Try both styles. Hashnode has historically accepted raw tokens in Authorization,
  // but some setups expect Bearer.
  const first = await tryRequest(trimmedToken, 'Authorization: <token>');
  if (!first.unauth) return;

  const second = await tryRequest(`Bearer ${trimmedToken}`, 'Authorization: Bearer <token>');
  if (!second.unauth) return;

  console.log(
    '\nUNAUTHENTICATED: token was rejected in both auth formats. ' +
      'Double-check you are using a Hashnode Personal Access Token with API access enabled.',
  );
  console.log('Token source:', tokenFrom);
  console.log('Tip: open https://hashnode.com/settings/developer and create a NEW token, then update .env.');
}

main();
