const endpoint = 'https://gql.hashnode.com/';

async function main() {
  const query = '{ __type(name:"Query"){ fields { name } } }';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    console.error('HTTP', response.status);
    console.error(JSON.stringify(payload.errors ?? payload, null, 2));
    process.exit(1);
  }

  const names = (payload.data?.__type?.fields ?? []).map((f) => f.name);
  const matched = names.filter((n) => /me|viewer|publication|profile/i.test(n)).sort();

  console.log('Matched query fields:', matched.length);
  console.log(matched.join('\n'));
}

main();
