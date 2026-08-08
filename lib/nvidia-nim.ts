import OpenAI from 'openai';

// Ensure the NVIDIA_API_KEY is loaded in your environment
const apiKey = process.env.NVIDIA_API_KEY;

if (!apiKey) {
  console.warn("NVIDIA_API_KEY is not set. NIM integration will fail.");
}

// NVIDIA NIM uses an OpenAI-compatible API structure
export const nimClient = new OpenAI({
  apiKey: apiKey || 'dummy_key_to_bypass_build_error',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

/**
 * Example usage:
 * 
 * const completion = await nimClient.chat.completions.create({
 *   model: "mistralai/mistral-nemotron",
 *   messages: [{"role":"user","content":"Hello!"}],
 *   max_tokens: 1024,
 *   stream: true
 * })
 */
