import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  uuidV4,
  uuidV7,
  uuidEncode,
  uuidDecode,
  smUuidV4,
  smUuidV7,
  uuidProfanityCheck,
} from '../src/index.js';

describe('sm-uuid', () => {
  describe('uuidProfanityCheck', () => {
    it('should return true for strings containing profanity', () => {
      assert.equal(uuidProfanityCheck('somefuckstring'), true);
      assert.equal(uuidProfanityCheck('040FAG0000000000000000'), true);
      assert.equal(uuidProfanityCheck('testsh1tvalue'), true);
      assert.equal(uuidProfanityCheck('abc123b1tchxyz'), true);
      assert.equal(uuidProfanityCheck('myc0cktest'), true);
    });

    it('should return false for clean strings', () => {
      assert.equal(uuidProfanityCheck('040JcVpU9fE00000000001'), false);
      assert.equal(uuidProfanityCheck('018e28f8a0007000800000'), false);
      assert.equal(uuidProfanityCheck('cleanString1234567890'), false);
    });
  });

  describe('uuidV4', () => {
    it('should generate valid standard UUID v4 strings', () => {
      const v4 = uuidV4();
      assert.match(v4, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('uuidV7', () => {
    it('should generate valid standard UUID v7 strings', () => {
      const v7 = uuidV7();
      assert.match(v7, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('uuidEncode & uuidDecode', () => {
    it('should encode and decode UUID v4 roundtrip correctly', () => {
      const orig = uuidV4();
      const encoded = uuidEncode(orig);
      assert.equal(encoded.length, 22);
      const decoded = uuidDecode(encoded);
      assert.equal(decoded.toLowerCase(), orig.toLowerCase());
    });

    it('should encode and decode UUID v7 roundtrip correctly', () => {
      const orig = uuidV7();
      const encoded = uuidEncode(orig);
      assert.equal(encoded.length, 22);
      const decoded = uuidDecode(encoded);
      assert.equal(decoded.toLowerCase(), orig.toLowerCase());
    });

    it('should handle zero BigInt encoding correctly', () => {
      const zeroUuid = '00000000-0000-0000-0000-000000000000';
      const encoded = uuidEncode(zeroUuid);
      assert.equal(encoded, '0000000000000000000000');
      assert.equal(uuidDecode(encoded), zeroUuid);
    });

    it('should throw error when encoding invalid UUID string', () => {
      assert.throws(() => uuidEncode('invalid-uuid'), /Invalid UUID string/);
      assert.throws(() => uuidEncode('12345'), /Invalid UUID string/);
    });

    it('should throw error when decoding invalid length string', () => {
      assert.throws(() => uuidDecode('too-short'), /Invalid encoded length/);
      assert.throws(() => uuidDecode('01234567890123456789012'), /Invalid encoded length/);
    });

    it('should throw error when decoding invalid Base62 character', () => {
      assert.throws(() => uuidDecode('040JcVpU9fE0000000000!'), /Invalid Base62 character/);
    });
  });

  describe('smUuidV4', () => {
    it('should generate profanity-free 22-character Base62 string', () => {
      const encoded = smUuidV4();
      assert.equal(encoded.length, 22);
      assert.equal(uuidProfanityCheck(encoded), false);

      const decoded = uuidDecode(encoded);
      assert.match(decoded, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('smUuidV7', () => {
    it('should generate profanity-free 22-character Base62 string', () => {
      const encoded = smUuidV7();
      assert.equal(encoded.length, 22);
      assert.equal(uuidProfanityCheck(encoded), false);
    });

it('should maintain chronological lexicographical sort order', async () => {
  const enc1 = smUuidV7();
  await new Promise((resolve) => setTimeout(resolve, 2));
  const enc2 = smUuidV7();

  assert.equal(enc1.length, 22);
  assert.equal(enc2.length, 22);
  assert.ok(enc1 < enc2);
});
  });
});