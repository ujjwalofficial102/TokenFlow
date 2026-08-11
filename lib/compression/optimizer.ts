import { countTokens } from '../tokenizer/counter';
import { normalizePrompt } from '../utils/normalization';
import { CompressionResult } from '@/types';

/**
 * Intelligent prompt compression engine.
 * Strips conversational fluff, informal slang (bro, bruh, dude, mate, man),
 * and introductory/tail fillers to isolate the core semantic intent.
 * 
 * Examples:
 * - "TELL ME ABOUT JAVA BRO" -> "What is java"
 * - "whats java bruh" -> "What is java"
 * - "Can you explain to me in detail what exactly the MERN Stack is..." -> "Explain MERN Stack"
 */
export function compressPromptRuleBased(prompt: string): string {
  if (!prompt) return '';
  
  let cleaned = prompt.trim();
  
  // 1. Strip conversational introductory phrases
  cleaned = cleaned.replace(/^(can you|could you|please|kindly|i want to know|tell me about|tell me|explain to me|give me|so|hey|hi|hello|would you|show me)\s+/i, '');
  
  // 2. Strip informal slang endings / fillers (bro, bruh, dude, man, mate, etc.)
  cleaned = cleaned.replace(/\b(bro|bruh|dude|man|mate|fam|pls|please|sir|thanks|thank you|in detail|what exactly is|what is meant by|step by step|for beginners|because i am new|because im completely new)\b/gi, '');
  
  // 3. Normalize "whats" / "what's" / "tell me" to standard query phrasing
  cleaned = cleaned.replace(/^(whats|what's)\s+/i, 'what is ');

  // 4. Normalize internal spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // If prompt was reduced to just "java", prefix with "What is " for canonical semantic representation
  if (/^[a-zA-Z0-9\s#+-]+$/.test(cleaned) && cleaned.split(' ').length <= 2 && !cleaned.toLowerCase().startsWith('what') && !cleaned.toLowerCase().startsWith('explain')) {
    cleaned = `What is ${cleaned}`;
  }

  // Fallback to original if compression resulted in empty or < 2 chars
  if (cleaned.length < 2) {
    return prompt.trim();
  }

  // Capitalize first letter cleanly
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Optimizes user prompt tokens and returns compression metadata.
 */
export async function optimizePrompt(originalPrompt: string): Promise<CompressionResult> {
  const original = originalPrompt.trim();
  const originalTokens = countTokens(original);

  const optimizedPrompt = compressPromptRuleBased(original);
  const normalizedPrompt = normalizePrompt(optimizedPrompt);
  const optimizedTokens = countTokens(optimizedPrompt);
  
  const tokensSaved = Math.max(0, originalTokens - optimizedTokens);

  return {
    originalPrompt: original,
    optimizedPrompt,
    normalizedPrompt,
    originalTokens,
    optimizedTokens,
    tokensSaved,
  };
}
