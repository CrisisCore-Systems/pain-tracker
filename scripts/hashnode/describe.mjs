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
  // Render GraphQL type like [Foo!]! from the kind chain.
  const chain = unwrapType(typeRef);

  function rec(index) {
    const node = chain[index];
    if (!node) return 'Unknown';

    if (node.kind === 'NON_NULL') {
      return `${rec(index + 1)}!`;
    }

    if (node.kind === 'LIST') {
      return `[${rec(index + 1)}]`;
    }

    return node.name ?? node.kind;
  }

  return rec(0);
}

async function gql(query, variables) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
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
  const fieldName = process.argv[2];
  if (!fieldName) {
    console.error('Usage: node scripts/hashnode/describe.mjs <mutationFieldName>');
    process.exit(2);
  }

  const data = await gql(
    `query {
      __type(name: "Mutation") {
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
  );

  const field = data.__type?.fields?.find((f) => f.name === fieldName);
  if (!field) {
    console.error(`No mutation field named: ${fieldName}`);
    process.exit(2);
  }

  console.log(field.name);
  console.log('Args:');
  for (const arg of field.args ?? []) {
    console.log(`- ${arg.name}: ${formatType(arg.type)}`);
  }
  console.log('Returns:', formatType(field.type));

  // If it takes a single input arg, attempt to print the input object fields.
  const inputArg = (field.args ?? []).find((a) => /input/i.test(a.name));
  const inputTypeName = unwrapType(inputArg?.type ?? null)
    .map((t) => t.name)
    .find((n) => n && !['NON_NULL', 'LIST'].includes(n));

  if (inputTypeName && /Input$/.test(inputTypeName)) {
    const input = await gql(
      `query($name: String!) {
        __type(name: $name) {
          kind
          name
          inputFields {
            name
            type { kind name ofType { kind name ofType { kind name ofType { kind name }}}}
          }
        }
      }`,
      { name: inputTypeName },
    );

    const inputFields = input.__type?.inputFields ?? [];
    if (inputFields.length) {
      console.log(`\nInput ${inputTypeName}:`);
      for (const f of inputFields) {
        console.log(`- ${f.name}: ${formatType(f.type)}`);
      }
    }
  }
}

main();
