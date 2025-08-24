// Minimal Node server for local testing: `npm start` then POST to http://localhost:3000/api/tts
import 'dotenv/config';
import express from 'express';
import handler from './api/tts.js';

const app = express();
app.use(express.json({limit:'1mb'}));
app.post('/api/tts', (req,res)=>handler(req,res));
app.get('/', (_req,res)=>res.type('text/plain').send('TTS backend is running. POST /api/tts'));
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`TTS server on http://localhost:${port}`));
