/*
 * Converts between human-readable text and raw binary strings.
 *
 * We use the standard TextEncoder/TextDecoder APIs (UTF-8) so that
 * the protocol handles emoji, accented characters, and any Unicode
 * text out of the box.
 */


/** Serializes a string into a binary bit-string ("01001000 01101001 …"). */
export function textToBinary(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);

  let output = '';
  for (const byte of bytes) {
    output += byte.toString(2).padStart(8, '0');
  }
  return output;
}


/** Reconstructs a string from a binary bit-string. */
export function binaryToText(bits: string): string {
  // Align to the nearest full byte
  const usable = bits.substring(0, Math.floor(bits.length / 8) * 8);

  const bytes = new Uint8Array(usable.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(usable.substring(i * 8, i * 8 + 8), 2);
  }

  return new TextDecoder().decode(bytes);
}
