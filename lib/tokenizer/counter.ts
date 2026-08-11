import { getEncoding } from 'js-tiktoken';

let tiktokenEncoder: ReturnType<typeof getEncoding> | null = null;

function getEncoder() {
  if (!tiktokenEncoder) {
    try {
      tiktokenEncoder = getEncoding('cl100k_base');
    } catch {
      tiktokenEncoder = null;
    }
  }
  return tiktokenEncoder;
}

/**
 * Counts the number of tokens in a given text string.
 * Uses tiktoken cl100k_base encoder with an accurate character heuristic fallback.
 */
export function countTokens(text: string): number {
  if (!text) return 0;
  
  try {
    const encoder = getEncoder();
    if (encoder) {
      return encoder.encode(text).length;
    }
  } catch (err) {
    console.warn('Tiktoken counting fallback used:', err);
  }

  // Fallback heuristic: word count + punctuation estimation ~ 1 token per 3.8 chars
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).length;
  const charTokens = Math.ceil(trimmed.length / 3.8);
  return Math.max(words, charTokens);
}
