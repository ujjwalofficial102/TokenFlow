/**
 * Normalizes a user prompt for exact caching lookups.
 * - Lowercases all text
 * - Removes leading/trailing punctuation and extra whitespace
 * - Standardizes formatting
 * 
 * Example:
 * "  What is MERN Stack?  " -> "what is mern stack"
 */
export function normalizePrompt(prompt: string): string {
  if (!prompt) return '';

  return prompt
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation characters
    .replace(/\s+/g, ' ')   // collapse whitespace
    .trim();
}
