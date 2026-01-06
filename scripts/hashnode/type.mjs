const endpoint = 'https://gql.hashnode.com/';

function unwrapType(typeRef) {
  const chain = [];
  let current = typeRef;
  while (current) {
    chain.push({ kind: current.kind, name: current.name });
    current = current.ofType;
  }
  return chain;
}

function formatType(typeRef) {
  const chain = unwrapType(typeRef);

  function rec(index) {
    const node = chain[index];
    if (!node) return 'Unknown';

    if (node.kind === 'NON_NULL') return `${rec(index + 1)}!`;
    if (node.kind === 'LIST') return `[${rec(index + 1)}]`;
    return node.name ?? node.kind;
  }

  return rec(0);
}

async function gql(query, variables) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    console.error('HTTP', response.status);
    console.error(JSON.stringify(payload.errors ?? payload, null, 2));
    process.exit(1);
  }

  return payload.data;
}

async function main() {
  const typeName = process.argv[2];
  if (!typeName) {
    console.error('Usage: node scripts/hashnode/type.mjs <TypeName>');
    process.exit(2);
  }

  const data = await gql(
    `query($name: String!) {
      __type(name: $name) {
        kind
        name
        fields {
          name
          type { kind name ofType { kind name ofType { kind name ofType { kind name }}}}
        }
        inputFields {
          name
          type { kind name ofType { kind name ofType { kind name ofType { kind name }}}}
        }
      }
    }`,
    { name: typeName },
  );

  const t = data.__type;
  if (!t) {
    console.error(`Unknown type: ${typeName}`);
    process.exit(2);
  }

  console.log(`${t.name} (${t.kind})`);

  const fields = t.fields ?? [];
  if (fields.length) {
    console.log('Fields:');
    for (const f of fields) {
      console.log(`- ${f.name}: ${formatType(f.type)}`);
    }
  }

  const inputFields = t.inputFields ?? [];
  if (inputFields.length) {
    console.log('Input fields:');
    for (const f of inputFields) {
      console.log(`- ${f.name}: ${formatType(f.type)}`);
    }
  }
}

main();
