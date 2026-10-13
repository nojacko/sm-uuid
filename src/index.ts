const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = 62n;
const TARGET_LEN = 22;

const CHAR_MAP = new Map<string, bigint>();
for (let i = 0; i < ALPHABET.length; i++) {
  CHAR_MAP.set(ALPHABET[i], BigInt(i));
}

const PROFANITY_PATTERNS = [
  'a[r0]s[e3]', // arse
  'a[s5]{2}', // ass
  'b[a4]st[a4]rd', // bastard
  'b[i1]tch', // bitch
  'c[o0]ck', // cock
  'c[u1]m', // cum
  'c[u1]nt', // cunt
  'ch[i1]nk', // chink
  'd[i1]ck', // dick
  'd[y1]k[e3]', // dyke
  'f[a4]g', // fag
  'f[u1]ck', // fuck
  'j[i1]zz', // jizz
  'k[i1]k[e3]', // kike
  'k[i1]ll', // kill
  'n[a4]z[i1]', // nazi
  'n[i1]gg', // n-word
  'n[o0]nc[e3]', // nonce
  'p([a4]?[e3]|[a4])d[o0]', // pedo / paedo
  'p[e3]n[i1]s', // penis
  'p[i1][s5]{2}', // piss
  'p[o0]rn', // porn
  'p[u1]ssy', // pussy
  'pr[i1]ck', // prick
  'r[a4]p[e3i1]', // rape / rapist
  'r[e3]t[a4]rd', // retard
  'sh[i1]t', // shit
  'sl[u1]t', // slut
  'sp[i1]c', // spic
  'su[i1]c[i1]d', // suicide / suicidal
  'tw[a4]t', // twat
  'w[a4]nk', // wank
  'wh[o0]r[e3]', // whore
];

const PROFANITY_REGEX = new RegExp(PROFANITY_PATTERNS.join('|'), 'i');

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
    throw new Error(
      `Invalid encoded length: expected ${TARGET_LEN} characters`,
    );
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

export function interleave(s: string): string {
  const midpoint = Math.ceil(s.length / 2);
  const firstHalf = s.slice(0, midpoint);
  const secondHalf = s.slice(midpoint);
  let result = '';
  for (let i = 0; i < midpoint; i++) {
    result += firstHalf[i];
    if (i < secondHalf.length) result += secondHalf[i];
  }
  return result;
}

export function deinterleave(s: string): string {
  let firstHalf = '';
  let secondHalf = '';
  for (let i = 0; i < s.length; i += 2) {
    firstHalf += s[i];
    if (i + 1 < s.length) secondHalf += s[i + 1];
  }
  return firstHalf + secondHalf;
}

export function uuidHasProfanity(str: string): boolean {
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

export function smUuidEncode(uuid: string): string {
  return interleave(bigIntToBase62(uuidToBigInt(uuid)));
}

export function smUuidDecode(encoded: string): string {
  return bigIntToUuid(base62ToBigInt(deinterleave(encoded)));
}

export function smUuidV4(): string {
  let encoded = smUuidEncode(uuidV4());
  while (uuidHasProfanity(encoded)) {
    encoded = smUuidEncode(uuidV4());
  }
  return encoded;
}

export function smUuidV7(timestamp = Date.now()): string {
  let rand = getRandomBytes(10);
  let bytes = buildV7Bytes(timestamp, rand);
  let encoded = smUuidEncode(bigIntToUuid(bytesToBigInt(bytes)));

  while (uuidHasProfanity(encoded)) {
    rand = getRandomBytes(10);
    bytes = buildV7Bytes(timestamp, rand);
    encoded = smUuidEncode(bigIntToUuid(bytesToBigInt(bytes)));
  }

  return encoded;
}
