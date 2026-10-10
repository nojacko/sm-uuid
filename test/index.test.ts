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
    it('should return true for comprehensive profanity list', () => {
      const TEST_CASES: [string, string[]][] = [
        ['fuck', ['fuck', 'f1ck', 'FUCK', 'F1CK']],
        ['shit', ['shit', 'sh1t', 'SHIT', 'SH1T']],
        ['cunt', ['cunt', 'c1nt', 'CUNT', 'C1NT']],
        ['bitch', ['bitch', 'b1tch', 'BITCH', 'B1TCH']],
        ['slut', ['slut', 'sl1t', 'SLUT', 'SL1T']],
        ['prick', ['prick', 'pr1ck', 'PRICK', 'PR1CK']],
        ['fag', ['fag', 'f4g', 'FAG', 'F4G']],
        ['dick', ['dick', 'd1ck', 'DICK', 'D1CK']],
        ['cock', ['cock', 'c0ck', 'COCK', 'C0CK']],
        ['pussy', ['pussy', 'p1ssy', 'PUSSY', 'P1SSY']],
        ['nigg', ['nigg', 'n1gg', 'NIGG', 'N1GG']],
        ['bastard', ['bastard', 'b4st4rd', 'BASTARD', 'B4ST4RD']],
        ['penis', ['penis', 'p3n1s', 'PENIS', 'P3N1S']],
        ['twat', ['twat', 'tw4t', 'TWAT', 'TW4T']],
        ['wank', ['wank', 'w4nk', 'WANK', 'W4NK']],
        ['whore', ['whore', 'wh0r3', 'WHORE', 'WH0R3']],
        ['retard', ['retard', 'r3t4rd', 'RETARD', 'R3T4RD']],
        ['ass', ['ass', 'a55', 'ASS', 'A55']],
        ['cum', ['cum', 'c1m', 'CUM', 'C1M']],
        ['kike', ['kike', 'k1k3', 'KIKE', 'K1K3']],
        ['chink', ['chink', 'ch1nk', 'CHINK', 'CH1NK']],
        ['spic', ['spic', 'sp1c', 'SPIC', 'SP1C']],
        ['dyke', ['dyke', 'd1k3', 'dyk3', 'DYKE']],
        ['jizz', ['jizz', 'j1zz', 'JIZZ', 'J1ZZ']],
        ['porn', ['porn', 'p0rn', 'PORN', 'P0RN']],
        ['piss', ['piss', 'p1ss', 'p155', 'PISS', 'P155']],
        ['arse', ['arse', 'ars3', 'a0s3', 'ARSE', 'A0S3']],
        ['pedo / paedo', ['pedo', 'paedo', 'p4ed0', 'p4d0', 'PEDO', 'PAEDO']],
        ['nonce', ['nonce', 'n0nc3', 'NONCE', 'N0NC3']],
        ['rape', ['rape', 'r4p3', 'RAPE', 'R4P3']],
        ['suicide', ['suicide', 'su1c1d3', 'su1c1d', 'SUICIDE']],
        ['kill', ['kill', 'k1ll', 'KILL', 'K1LL']],
        ['nazi', ['nazi', 'n4z1', 'NAZI', 'N4Z1']],
      ];

      for (const [, variants] of TEST_CASES) {
        for (const variant of variants) {
          // Embedded in a mock 22-char Base62 string to mirror real UUID checks
          const embeddedStr = `040${variant}0000000000000000`.slice(0, 22);
          assert.equal(
            uuidProfanityCheck(embeddedStr),
            true,
            `Failed to catch variant: "${variant}" in "${embeddedStr}"`,
          );
        }
      }
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
      assert.match(
        v4,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('uuidV7', () => {
    it('should generate valid standard UUID v7 strings', () => {
      const v7 = uuidV7();
      assert.match(
        v7,
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
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
      assert.throws(
        () => uuidDecode('01234567890123456789012'),
        /Invalid encoded length/,
      );
    });

    it('should throw error when decoding invalid Base62 character', () => {
      assert.throws(
        () => uuidDecode('040JcVpU9fE0000000000!'),
        /Invalid Base62 character/,
      );
    });

    it('should encode the maximum theoretical UUID to exactly 22 characters', () => {
      const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      const encoded = uuidEncode(maxUuid);

      assert.equal(encoded.length, 22, encoded);
      assert.equal(uuidDecode(encoded).toLowerCase(), maxUuid.toLowerCase());
    });
  });

  describe('smUuidV4', () => {
    it('should generate profanity-free 22-character Base62 string', () => {
      const encoded = smUuidV4();
      assert.equal(encoded.length, 22);
      assert.equal(uuidProfanityCheck(encoded), false);

      const decoded = uuidDecode(encoded);
      assert.match(
        decoded,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
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
