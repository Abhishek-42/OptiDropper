/*
 * Lightweight checksum and binary conversion helpers.
 *
 * We use a simple 8-bit CRC here because the visual channel is
 * inherently lossy — the checksum lets the decoder discard corrupt
 * frames quickly rather than feeding garbage into the assembler.
 */


/**
 * Computes an 8-bit CRC over a binary string ("101001…").
 * Uses polynomial 0xB2 which has good short-burst error detection.
 */
export function computeChecksum(bits: string): number {
  let crc = 0x00;

  for (let i = 0; i < bits.length; i++) {
    const bit = bits.charCodeAt(i) === 49 ? 1 : 0;   // '1' → 1, anything else → 0
    crc ^= bit;

    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? ((crc >> 1) ^ 0xB2) : (crc >> 1);
    }
  }

  return crc & 0xFF;
}


/** Converts a non-negative integer to a fixed-width binary string. */
export function toBits(value: number, width: number): string {
  return value.toString(2).padStart(width, '0');
}


/** Parses a binary string back into an integer. */
export function fromBits(bits: string): number {
  return parseInt(bits, 2);
}
