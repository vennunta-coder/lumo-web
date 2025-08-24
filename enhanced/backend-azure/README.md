# TTS Backend — Azure Neural TTS (Serverless-ready)

Este backend mantém a **API key** em segurança no servidor e expõe `/api/tts` para o front-end (Divine Oracle).

## Deploy rápido (Vercel)
1. `npm i` (Node 18+)
2. Cria o projeto na Vercel e define as variáveis:
   - `AZURE_TTS_KEY`
   - `AZURE_TTS_REGION` (ex.: `westeurope`, `eastus`, `brazilsouth`)
   - `AZURE_TTS_VOICE` (ex.: `pt-PT-AnaNeural`)
3. Faz deploy. O endpoint ficará em `https://teuapp.vercel.app/api/tts`

## Local
```
cp .env.example .env   # coloca as tuas chaves
npm i express dotenv
npm start
# POST http://localhost:3000/api/tts com JSON: { "text":"Olá", "lang":"pt-PT", "voice":"pt-PT-AnaNeural", "persona":"woman" }
```

## Segurança
- Não expor chaves no cliente. O HTML chama **/api/tts** e o servidor fala com a Azure.
- Ajusta a voz conforme o idioma do visitante. Podes mapear automaticamente no servidor se quiseres.
