# sm-uuid

A zero-dependency, cross-platform Base62 UUID v7 and v4 library with smart profanity filtering. Works out of the box in **Node.js**, **modern browsers**, **Bun**, **Deno**, and **Edge runtimes**.

Encodes 128-bit UUIDs into fixed 22-character Base62 strings while eliminating offensive words and common leet-speak substitutions.

[Try the live demo](https://nojacko.github.io/sm-uuid/)

## Features

- **Profanity Protection (`smUuidV7`, `smUuidV4`):** Automatically re-rolls the IDs if they contain severe profanity or direct visual leet-speak replacements (e.g., `1` → `i`, `0` → `o`, `4` → `a`).
- **Universal Crypto:** Built on top of `globalThis.crypto` for seamless compatibility across client and server environments.
- **Zero Dependencies:** Pure TypeScript with both ESM and CommonJS exports.

## Installation

```bash
npm install sm-uuid
```

## API & Usage

```typescript
import {
  uuidV4,
  uuidV7,
  smUuidEncode,
  smUuidDecode,
  smUuidV4,
  smUuidV7,
} from 'sm-uuid';

// 1. Generate 22-character profanity-safe Base62 UUIDs (Recommended)
const safeV7 = smUuidV7(); // "040JcVpU9fE00000000001" (22 chars)
const safeV4 = smUuidV4(); // "3kL9pR2wQ8Xz1vN7mM0aBb" (Random, 22 chars)

// 2. Standard UUID string generators (Unfiltered)
const standardV7 = uuidV7(); // "018e28f8-a000-7000-8000-000000000001"
const standardV4 = uuidV4(); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// 3. Encode & Decode Base62 strings
const encoded = smUuidEncode('018e28f8-a000-7000-8000-000000000001');
// -> "040JcVpU9fE00000000001"

const decoded = smUuidDecode(encoded);
// -> "018e28f8-a000-7000-8000-000000000001"
```

## How the Profanity Filter Works

When calling `smUuidV7()` or `smUuidV4()`, the output is checked against a targeted profanity regex. If a forbidden sequence is detected:

1. **UUID v7:** The Base62 value is interleaved from its timestamp and random halves, spreading both parts throughout the output. If a forbidden sequence is found, only the random bytes are regenerated and the same timestamp is reused, so filtering cannot discard the original timestamp.
2. **UUID v4:** The entire UUID is generated again because all of its data is random.

This ensures generation completes in under a microsecond without high-CPU retry loops.

## Development & Building

### Build Package

```bash
npm run build
```

### Lint / Formatting

```bash
npm run fmt
```

### Run Tests

```bash
npm test
```

## Publishing

Authenticate with npm once, then bump the package version and publish the built package:

```bash
npm login
npm version patch # or: minor / major
npm run build
npm publish
```

## License

MIT
