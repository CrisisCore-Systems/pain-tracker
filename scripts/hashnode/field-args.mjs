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
  const fieldName = process.argv[3];
  if (!typeName || !fieldName) {
    console.error('Usage: node scripts/hashnode/field-args.mjs <TypeName> <fieldName>');
    process.exit(2);
  }

  const data = await gql(
    `query($name: String!) {
      __type(name: $name) {
        name
        fields {
          name
          args {
            name
            type { kind name ofType { kind name ofType { kind name ofType { kind name }}}}
          }
          type { kind name ofType { kind name ofType { kind name ofType { kind name }}}}
        }
      }
    }`,
    { name: typeName },
  );

  const field = data.__type?.fields?.find((f) => f.name === fieldName);
  if (!field) {
    console.error(`No field ${typeName}.${fieldName}`);
    process.exit(2);
  }

  console.log(`${typeName}.${fieldName}: ${formatType(field.type)}`);
  console.log('Args:');
  for (const arg of field.args ?? []) {
    console.log(`- ${arg.name}: ${formatType(arg.type)}`);
  }
}

main();
