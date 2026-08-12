import { randomBytes } from 'crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length;

function toBase62(buf: Buffer): string {
  let num = BigInt('0x' + buf.toString('hex'));
  if (num === 0n) return ALPHABET[0];
  let out = '';
  while (num > 0) {
    const rem = Number(num % BigInt(BASE));
    out = ALPHABET[rem] + out;
    num = num / BigInt(BASE);
  }
  return out;
}

export function generateAlias(length = 8): string {
  // generate enough random bytes and base62-encode them, then take slice
  const bytes = randomBytes(Math.ceil(length * Math.log2(62) / 8));
  const s = toBase62(bytes);
  // pad if too short
  if (s.length >= length) return s.slice(0, length);
  return (ALPHABET[0].repeat(length - s.length) + s).slice(0, length);
}
