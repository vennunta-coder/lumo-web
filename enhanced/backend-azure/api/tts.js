// /api/tts.js — Serverless function (Vercel, Netlify Functions adapter, or Node server)
// Azure Neural TTS proxy — keeps your API key on the server side.
// POST JSON: { engine:"azure", text, lang, voice, persona }
// Returns: audio/mpeg (MP3)
export default async function handler(req, res){
  try{
    if (req.method !== 'POST') {
      res.status(405).json({error:'Method not allowed'}); return;
    }
    const { text, lang, voice, persona } = req.body || {};
    if (!text) { res.status(400).json({error:'Missing text'}); return; }

    const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY;
    const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION;
    const DEFAULT_VOICE = process.env.AZURE_TTS_VOICE || 'pt-PT-AnaNeural'; // choose a realistic default

    if (!AZURE_TTS_KEY || !AZURE_TTS_REGION){
      res.status(500).json({error:'Server not configured (AZURE_TTS_KEY / AZURE_TTS_REGION missing)'}); return;
    }

    // Voice selection
    const voiceName = (voice && typeof voice === 'string' && voice.trim()) ? voice.trim() : DEFAULT_VOICE;
    const userLang = (lang && typeof lang === 'string' && lang.trim()) ? lang.trim() : 'pt-PT';

    // Persona tweaks (optional): adjust speaking style via SSML (Azure supports styles for some voices).
    const style = (persona === 'child') ? 'cheerful' : (persona === 'man' ? 'narration-professional' : 'general');
    const rate = (persona === 'child') ? 'medium' : '0%';
    const pitch = (persona === 'child') ? '+10%' : (persona === 'man' ? '-5%' : '+0%');

    const ssml = `<?xml version="1.0" encoding="utf-8"?>
<speak version="1.0" xml:lang="${userLang}">
  <voice name="${voiceName}">
    <prosody rate="${rate}" pitch="${pitch}">${escapeXml(text)}</prosody>
  </voice>
</speak>`;

    const endpoint = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'imagination-divine-oracle/1.0'
      },
      body: ssml
    });

    if (!r.ok){
      const txt = await r.text();
      res.status(500).json({error:'Azure TTS failed', detail: txt}); return;
    }
    const arrayBuffer = await r.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buf);
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Server error', detail: String(e)});
  }
}

// Simple XML escape for SSML
function escapeXml(s){
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
