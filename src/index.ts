const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = 62n;
const TARGET_LEN = 22;

const CHAR_MAP = new Map<string, bigint>();
for (let i = 0; i < ALPHABET.length; i++) {
  CHAR_MAP.set(ALPHABET[i], BigInt(i));
}

// Focused regex matching severe profanity and direct '1' -> 'i' / '0' -> 'o' / '4' -> 'a' substitutions
const PROFANITY_REGEX = /f[u1]ck|sh[i1]t|c[u1]nt|b[i1]tch|sl[u1]t|pr[i1]ck|f[a4]g|f[a4]gg0t|d[i1]ck|c[o0]ck|p[u1]ssy/i;

function getCrypto(): Crypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API is not available in this environment');
}

function getRandomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  getCrypto().getRandomValues(bytes);
  return bytes;
}

function uuidToBigInt(uuid: string): bigint {
  const hex = uuid.replace(/-/g, '');
  if (hex.length !== 32 || !/^[0-9a-fA-F]{32}$/.test(hex)) {
    throw new Error(`Invalid UUID string: ${uuid}`);
  }
  return BigInt(`0x${hex}`);
}

function bigIntToUuid(value: bigint): string {
  const hex = value.toString(16).padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function bigIntToBase62(value: bigint): string {
  if (value === 0n) return '0'.repeat(TARGET_LEN);
  let num = value;
  let result = '';
  while (num > 0n) {
    const remainder = Number(num % BASE);
    result = ALPHABET[remainder] + result;
    num = num / BASE;
  }
  return result.padStart(TARGET_LEN, '0');
}

function base62ToBigInt(encoded: string): bigint {
  if (encoded.length !== TARGET_LEN) {
    throw new Error(`Invalid encoded length: expected ${TARGET_LEN} characters`);
  }
  let value = 0n;
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    const digit = CHAR_MAP.get(char);
    if (digit === undefined) {
      throw new Error(`Invalid Base62 character: '${char}'`);
    }
    value = value * BASE + digit;
  }
  return value;
}

function buildV7Bytes(timestamp: number, randBytes: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(16);

  bytes[0] = Math.floor(timestamp / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(timestamp / 0x100000000) & 0xff;
  bytes[2] = Math.floor(timestamp / 0x1000000) & 0xff;
  bytes[3] = Math.floor(timestamp / 0x10000) & 0xff;
  bytes[4] = Math.floor(timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;

  bytes[6] = (randBytes[0] & 0x0f) | 0x70;
  bytes[7] = randBytes[1];
  bytes[8] = (randBytes[2] & 0x3f) | 0x80;
  bytes[9] = randBytes[3];
  bytes[10] = randBytes[4];
  bytes[11] = randBytes[5];
  bytes[12] = randBytes[6];
  bytes[13] = randBytes[7];
  bytes[14] = randBytes[8];
  bytes[15] = randBytes[9];

  return bytes;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return BigInt(`0x${hex}`);
}

/**
 * Checks if a given string contains profanity according to the internal blocklist.
 * Returns true if profanity is detected, false otherwise.
 */
export function uuidProfanityCheck(str: string): boolean {
  return PROFANITY_REGEX.test(str);
}

export function uuidV4(): string {
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bigIntToUuid(bytesToBigInt(bytes));
}

export function uuidV7(): string {
  const ts = Date.now();
  const rand = getRandomBytes(10);
  return bigIntToUuid(bytesToBigInt(buildV7Bytes(ts, rand)));
}

export function uuidEncode(uuid: string): string {
  return bigIntToBase62(uuidToBigInt(uuid));
}

export function uuidDecode(encoded: string): string {
  return bigIntToUuid(base62ToBigInt(encoded));
}

export function smUuidV4(): string {
  let encoded = uuidEncode(uuidV4());
  while (uuidProfanityCheck(encoded)) {
    encoded = uuidEncode(uuidV4());
  }
  return encoded;
}

export function smUuidV7(): string {
  let timestamp = Date.now();
  let rand = getRandomBytes(10);
  let encoded = bigIntToBase62(bytesToBigInt(buildV7Bytes(timestamp, rand)));

  while (uuidProfanityCheck(encoded)) {
    const match = PROFANITY_REGEX.exec(encoded);
    if (match && match.index < 8) {
      timestamp += 1;
    } else {
      rand = getRandomBytes(10);
    }
    encoded = bigIntToBase62(bytesToBigInt(buildV7Bytes(timestamp, rand)));
  }

  return encoded;
}