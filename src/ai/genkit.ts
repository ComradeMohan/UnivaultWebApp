import { createRequire } from 'module';

// Polyfill SlowBuffer for Node.js 25+ compatibility with buffer-equal-constant-time
if (typeof window === 'undefined') {
  try {
    const requireFn = createRequire(import.meta.url);
    const b = requireFn('buffer');
    if (b && !b.SlowBuffer) {
      b.SlowBuffer = function() {};
      b.SlowBuffer.prototype = {};
    }
  } catch (e) {
    // Silently ignore in environment where createRequire is unavailable
  }
}


import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'MISSING_API_KEY_PLACEHOLDER';

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'googleai/gemini-2.5-flash',
});
