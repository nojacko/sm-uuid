# sm-uuid

A zero-dependency, cross-platform Base62 UUID v7 and v4 library with smart profanity filtering. Works out of the box in **Node.js**, **modern browsers**, **Bun**, **Deno**, and **Edge runtimes**.

Encodes 128-bit UUIDs into fixed 22-character Base62 strings that retain full lexicographical (chronological) sorting for UUID v7 while eliminating offensive words and common leet-speak substitutions.

## Features

- **Profanity Protection (`smUuidV7`, `smUuidV4`):** Automatically re-rolls matching IDs if they contain severe profanity or direct visual leet-speak replacements (e.g., `1` → `i`, `0` → `o`, `4` → `a`).
- **Smart Timestamp Shifting:** If a bad word occurs in the timestamp portion of a v7 ID, time is nudged by `+1ms` instead of entering a CPU-tight loop on identical timestamps.
- **Lexicographically Sortable:** Uses ASCII ordering (`0-9A-Za-z`) so string sorting matches chronological creation order.
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
const safeV7 = smUuidV7(); // "040JcVpU9fE00000000001" (Time-sortable, 22 chars)
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

### Passing Custom Timestamps to UUID v7

You can pass a custom Unix timestamp (in milliseconds) to both `uuidV7` and `smUuidV7`:

```typescript
const customTimeId = smUuidV7(1700000000000);
```

## How the Profanity Filter Works

When calling `smUuidV7()` or `smUuidV4()`, the output is checked against a targeted profanity regex. If a forbidden sequence is detected:

1. **Suffix Match (Random bits):** New random bytes are generated and re-encoded immediately.
2. **Prefix Match (Timestamp bits in v7):** The timestamp is shifted by `+1ms` to alter the prefix characters while maintaining chronological order.

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
