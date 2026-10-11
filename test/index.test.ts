import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  uuidV4,
  uuidV7,
  smUuidEncode,
  smUuidDecode,
  smUuidV4,
  smUuidV7,
  interleave,
  deinterleave,
  uuidHasProfanity,
} from '../src/index.js';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUIDS_TO_GENERATE = 100_000;

describe('sm-uuid', () => {
  describe('uuidHasProfanity', () => {
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
            uuidHasProfanity(embeddedStr),
            true,
            `Failed to catch variant: "${variant}" in "${embeddedStr}"`,
          );
        }
      }
    });

    it('should return false for clean strings', () => {
      assert.equal(uuidHasProfanity('040JcVpU9fE00000000001'), false);
      assert.equal(uuidHasProfanity('018e28f8a0007000800000'), false);
      assert.equal(uuidHasProfanity('cleanString1234567890'), false);
    });
  });

  describe('uuidV4', () => {
    it('should generate valid standard UUID v4 strings', () => {
      const v4 = uuidV4();
      assert.match(v4, UUID_V4_REGEX);
    });
  });

  describe('uuidV7', () => {
    it('should generate valid standard UUID v7 strings', () => {
      const v7 = uuidV7();
      assert.match(v7, UUID_V7_REGEX);
    });
  });

  describe('interleave & deinterleave', () => {
    it('should interleave correctly', () => {
      assert.equal(
        interleave('abcdefghijklmnopqrstuv'),
        'albmcndoepfqgrhsitjukv',
      );
    });

    it('should interleave strings of any length', () => {
      assert.equal(interleave('abcde'), 'adbec');
      assert.equal(interleave('abcd'), 'acbd');
      assert.equal(interleave(''), '');
    });

    it('should restore an interleaved value to its original halves', () => {
      const value = 'abcdefghijklmnopqrstuv';
      assert.equal(deinterleave(interleave(value)), value);
    });

    it('should restore odd-length and empty strings', () => {
      assert.equal(deinterleave(interleave('abcde')), 'abcde');
      assert.equal(deinterleave(interleave('')), '');
    });
  });

  describe('smUuidEncode & smUuidDecode', () => {
    it('should encode and decode UUID v4 roundtrip correctly', () => {
      const orig = uuidV4();
      const encoded = smUuidEncode(orig);
      assert.equal(encoded.length, 22);
      const decoded = smUuidDecode(encoded);
      assert.equal(decoded.toLowerCase(), orig.toLowerCase());
    });

    it('should encode and decode UUID v7 roundtrip correctly', () => {
      const orig = uuidV7();
      const encoded = smUuidEncode(orig);
      assert.equal(encoded.length, 22);
      const decoded = smUuidDecode(encoded);
      assert.equal(decoded.toLowerCase(), orig.toLowerCase());
    });

    it('should handle zero BigInt encoding correctly', () => {
      const zeroUuid = '00000000-0000-0000-0000-000000000000';
      const encoded = smUuidEncode(zeroUuid);
      assert.equal(encoded, '0000000000000000000000');
      assert.equal(smUuidDecode(encoded), zeroUuid);
    });

    it('should throw error when encoding invalid UUID string', () => {
      assert.throws(() => smUuidEncode('invalid-uuid'), /Invalid UUID string/);
      assert.throws(() => smUuidEncode('12345'), /Invalid UUID string/);
    });

    it('should throw error when decoding invalid length string', () => {
      assert.throws(() => smUuidDecode('too-short'), /Invalid encoded length/);
      assert.throws(
        () => smUuidDecode('01234567890123456789012'),
        /Invalid encoded length/,
      );
    });

    it('should throw error when decoding invalid Base62 character', () => {
      assert.throws(
        () => smUuidDecode('040JcVpU9fE0000000000!'),
        /Invalid Base62 character/,
      );
    });

    it('should encode the maximum theoretical UUID to exactly 22 characters', () => {
      const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      const encoded = smUuidEncode(maxUuid);

      assert.equal(encoded.length, 22, encoded);
      assert.equal(smUuidDecode(encoded).toLowerCase(), maxUuid.toLowerCase());
    });
  });

  describe('smUuidV4', () => {
    it("should encode and decode lots of unique profanity-free UUIDs", () => {
      const encodedUuids = new Set<string>();

      for (let i = 0; i < UUIDS_TO_GENERATE; i++) {
        const encoded = smUuidV4();
        assert.equal(encoded.length, 22);
        assert.equal(uuidHasProfanity(encoded), false);

        const decoded = smUuidDecode(encoded);
        assert.match(decoded, UUID_V4_REGEX);
        assert.equal(smUuidEncode(decoded), encoded);
        encodedUuids.add(encoded);
      }

      assert.equal(encodedUuids.size, UUIDS_TO_GENERATE);
    });
  });

  describe('smUuidV7', () => {
    it('should accept a timestamp and return a profanity-free UUID', () => {
      const encoded = smUuidV7(1757395081210);

      assert.equal(uuidHasProfanity(encoded), false);
    });

    it('should encode and decode lots of unique profanity-free UUIDs', () => {
      const encodedUuids = new Set<string>();

      for (let i = 0; i < UUIDS_TO_GENERATE; i++) {
        const encoded = smUuidV7();
        assert.equal(encoded.length, 22);
        assert.equal(uuidHasProfanity(encoded), false);

        const decoded = smUuidDecode(encoded);
        assert.match(decoded, UUID_V7_REGEX);
        assert.equal(smUuidEncode(decoded), encoded);
        encodedUuids.add(encoded);
      }

      assert.equal(encodedUuids.size, UUIDS_TO_GENERATE);
    });

  });
});
