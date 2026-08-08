const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  }
}

async function testKeys() {
  console.log("=== Checking API Keys & Services ===");
  
  // 1. Supabase
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log("Supabase Buckets:", buckets?.map(b => b.name), bErr ? bErr.message : "OK");

  // Create clips bucket if not exists
  if (buckets && !buckets.some(b => b.name === 'clips')) {
    console.log("Creating 'clips' storage bucket...");
    const { error: createErr } = await supabase.storage.createBucket('clips', { public: true });
    if (createErr) console.error("Error creating clips bucket:", createErr.message);
    else console.log("'clips' bucket created successfully!");
  }

  // 2. Groq
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in 3 words' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log("Groq Llama 3.3 70B Test Output:", completion.choices[0]?.message?.content);
  } catch (err) {
    console.error("Groq API Test Error:", err.message);
  }

  // 3. Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const res = await model.generateContent("Hello test");
    console.log("Gemini 2.5 Flash Test Output:", res.response.text());
  } catch (err) {
    // fallback to gemini-1.5-flash if 2.5 is different model name
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const res = await model.generateContent("Hello test");
      console.log("Gemini 1.5 Flash Test Output:", res.response.text());
    } catch (err2) {
      console.error("Gemini API Test Error:", err2.message);
    }
  }
}

testKeys();
