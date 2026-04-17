const fs = require('fs');
const path = require('path');

const SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION || 'eastasia';

if (!SPEECH_KEY) {
  console.error('Set AZURE_SPEECH_KEY env var');
  process.exit(1);
}

const audioDir = path.join(__dirname, '..', 'public', 'ai-english', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const WORDS = [
  { id: 'generate',  text: 'Generate a list of 10 startup ideas based on current AI trends.' },
  { id: 'create',    text: 'Create a REST API endpoint that returns user profile data in JSON.' },
  { id: 'write',     text: 'Write a unit test for the login function using Jest.' },
  { id: 'explain',   text: 'Explain how JavaScript closures work with a simple example.' },
  { id: 'summarize', text: 'Summarize this meeting transcript into three key action items.' },
  { id: 'improve',   text: 'Improve this error message to be more user-friendly and actionable.' },
  { id: 'refine',    text: 'Refine the database query to reduce response time below 200 milliseconds.' },
  { id: 'optimize',  text: 'Optimize this React component to prevent unnecessary re-renders.' },
  { id: 'rewrite',   text: 'Rewrite this callback-based code using async await syntax.' },
  { id: 'simplify',  text: 'Simplify this function so a junior developer can understand it.' },
  { id: 'format',    text: 'Format the output as a Markdown table with columns for name, type, and description.' },
  { id: 'convert',   text: 'Convert this SQL query into a Supabase JavaScript client call.' },
  { id: 'list',      text: 'List all the possible edge cases for this payment processing flow.' },
  { id: 'organize',  text: 'Organize these API routes into logical groups with clear naming conventions.' },
  { id: 'structure', text: 'Structure this project with separate folders for components, hooks, and utilities.' },
  { id: 'analyze',   text: 'Analyze this error log and identify the root cause of the crash.' },
  { id: 'compare',   text: 'Compare PostgreSQL and MongoDB for a high-traffic e-commerce application.' },
  { id: 'suggest',   text: 'Suggest three ways to improve the onboarding experience for new users.' },
  { id: 'simulate',  text: 'Simulate a conversation between a customer and a support agent about a refund request.' },
  { id: 'validate',  text: 'Validate this JSON schema and check if it handles all required fields correctly.' },
];

async function generateAudio(text, outputFile) {
  if (fs.existsSync(outputFile)) {
    console.log(`  SKIP (exists): ${path.basename(outputFile)}`);
    return;
  }

  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'>
    <voice name='en-US-JennyNeural'>
      <mstts:express-as style="friendly">
        <prosody rate="-10%">${escaped}</prosody>
      </mstts:express-as>
    </voice>
  </speak>`;

  const url = `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': SPEECH_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
    },
    body: ssml,
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  ERROR: ${path.basename(outputFile)} - ${err}`);
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputFile, buffer);
  console.log(`  OK: ${path.basename(outputFile)} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  console.log('Generating AI English audio files...\n');
  for (const word of WORDS) {
    const filepath = path.join(audioDir, `${word.id}.mp3`);
    await generateAudio(word.text, filepath);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\nDone. Processed ${WORDS.length} audio files.`);
}

main().catch(console.error);
