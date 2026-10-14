import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'dev-chat-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req: any, res: any) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let bodyStr = '';
            req.on('data', (chunk: any) => {
              bodyStr += chunk;
            });

            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const message = (body.message || '').trim();

                if (!message) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Message is required' }));
                  return;
                }

                const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      reply:
                        "👋 Hello! I am **SnapCut Assistant**.\n\nTo enable live Gemini AI generation in development, add `GEMINI_API_KEY=your_key` to your `.env` file (server-side, never exposed to client) or deploy the Supabase Edge Function with `supabase functions deploy chat`.\n\n**Quick SnapCut AI info:**\n- ⚡ **Background Removal**: 3-second instant AI cutouts with hair-level precision.\n- 🖼️ **Formats**: JPG, PNG, WEBP up to 10MB & 5000×5000px Ultra HD.\n- 🔒 **Privacy**: Files are permanently deleted after 24 hours.\n- 🎁 **Credits**: 5 free credits daily, or upgrade via Billing.",
                    })
                  );
                  return;
                }

                const CANDIDATE_MODELS = [
                  'gemini-3.5-flash-lite',
                  'gemini-3.8-flash',
                  'gemini-3.1-flash-lite',
                ];

                let reply = '';
                let lastError = '';

                for (const model of CANDIDATE_MODELS) {
                  try {
                    const response = await fetch(
                      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          systemInstruction: {
                            parts: [
                              {
                                text:
                                  'You are SnapCut Assistant, the official AI support specialist for SnapCut AI (snapcut.ai). SnapCut AI removes image backgrounds in ~3 seconds into transparent PNGs, supports up to 10MB / 5000x5000px Ultra HD, deletes files after 24 hours, offers 5 daily free credits, Pro Creator and Scale plans, and a developer REST API. Provide concise, friendly, helpful guidance with bullet points.',
                              },
                            ],
                          },
                          contents: [
                            ...(Array.isArray(body.history)
                              ? body.history.slice(-8).map((h: any) => ({
                                  role:
                                    h.sender === 'user' || h.role === 'user'
                                      ? 'user'
                                      : 'model',
                                  parts: [
                                    {
                                      text: String(h.text || h.parts?.[0]?.text || '').slice(0, 500),
                                    },
                                  ],
                                }))
                              : []),
                            { role: 'user', parts: [{ text: message }] },
                          ],
                          generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1200,
                            topP: 0.95,
                          },
                        }),
                      }
                    );

                    if (response.ok) {
                      const data: any = await response.json();
                      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (text) {
                        reply = text;
                        break;
                      }
                    } else {
                      const errData: any = await response.json().catch(() => ({}));
                      lastError = errData.error?.message || `Status ${response.status}`;
                      console.warn(`Model ${model} notice: ${lastError}. Trying next candidate...`);
                    }
                  } catch (err: any) {
                    lastError = err.message || String(err);
                    console.warn(`Model ${model} fetch exception: ${lastError}. Trying next candidate...`);
                  }
                }

                if (!reply) {
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: lastError || 'AI models temporarily unavailable' }));
                  return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ reply }));
              } catch (e: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message || 'Internal server error' }));
              }
            });
          });
        },
      },
    ],
    appType: 'spa',
  };
});
