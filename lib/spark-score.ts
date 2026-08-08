import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface SparkScore {
  hook: number;
  story: number;
  emotion: number;
  shareability: number;
  platform_fit: number;
  total: number;
  verdict: string;
  top_tip: string;
}

export async function generateSparkScore(
  clipTranscript: string, 
  durationSec: number, 
  visualEnergy: number
): Promise<SparkScore> {
  const prompt = `Score this video clip segment on these 5 dimensions (0-20 each). Be brutally honest — most clips score 50-70, only truly viral clips score 80+.

Clip transcript: ${clipTranscript}
Duration: ${durationSec} seconds
Visual energy (from AI analysis): ${visualEnergy}/100

1. HOOK (0-20): First 5 seconds grab attention?
2. STORY (0-20): Clear narrative arc?
3. EMOTION (0-20): Triggers strong feeling?
4. SHAREABILITY (0-20): Would you send this to someone?
5. PLATFORM_FIT (0-20): Pacing/length right for TikTok/Reels?

Respond only as JSON:
{
  "hook": 18,
  "story": 14,
  "emotion": 17,
  "shareability": 16,
  "platform_fit": 15,
  "total": 80,
  "verdict": "Strong hook, great for TikTok",
  "top_tip": "Cut the first 3 seconds, start at the punchline"
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  const responseContent = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(responseContent) as SparkScore;
}
