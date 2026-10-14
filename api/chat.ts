export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SNAPCUT_SYSTEM_INSTRUCTION = `You are SnapCut Assistant, the official AI support specialist for SnapCut AI (snapcut.ai).
Your job is to provide fast, helpful, accurate, and friendly support about SnapCut AI.

ABOUT SNAPCUT AI:
- Core Service: Instant AI-powered image background removal in ~3 seconds. Produces transparent PNGs with hair-level edge precision, handling intricate textures, portraits, e-commerce products, animals, and complex glass.
- File Formats Supported: JPG, JPEG, PNG, WEBP.
- Size & Resolution: File size up to 10MB; Ultra HD resolution up to 5000×5000 pixels (25 megapixels).
- Privacy & Auto-Purge Policy: SnapCut enforces a strict 24-hour temporary lifecycle via Cloudinary and automated cron jobs. Files and cutouts are permanently deleted after 24 hours. Zero permanent image retention.
- Credits & Pricing:
  * Free Tier: 5 free image credits replenished daily.
  * Pro Creator: ₹299/mo ($4.99/mo) - 100 credits/mo, priority processing queue, batch support, full HD download, commercial rights.
  * Scale & Studio: ₹899/mo ($14.99/mo) - 500 credits/mo, unlimited developer REST API access, dedicated AI worker node.
  * Pay-As-You-Go Credit Packs: Never expire (Starter: 25 credits for ₹99, Creator: 100 credits for ₹299, Agency: 500 credits for ₹999).
  * Payments: Processed securely via Razorpay (Cards, UPI, Netbanking).
- Developer REST API:
  * Authentication: API Key sent in header 'X-API-Key: sc_live_...'
  * Endpoint: POST https://api.snapcut.ai/v1/remove
  * Request Body: { "image_url": "https://...", "format": "png", "crop": true }
  * Instant sub-second response with cutout download URL.
- Common Troubleshooting:
  * Upload failed: Ensure file is under 10MB and format is JPG/PNG/WEBP. Check internet connection.
  * Out of credits: Free daily quota resets every 24 hours (5 credits). Or purchase credit packs or subscribe in the Billing / Credits page.
  * Low cutout clarity: Ensure subject has reasonable contrast or use original high-resolution photo.
  * Downloads: In the workspace, click "Download PNG" or view past 24-hour history in the Downloads tab.

COMMUNICATION STYLE:
- Keep answers friendly, concise, encouraging, and clear.
- Use bullet points when presenting steps or features.
- If asked questions completely unrelated to image editing, photography, or SnapCut AI, politely decline and steer the user back to SnapCut AI features.
- Never output markdown headers larger than h3 (###).
`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = body.message.trim();
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          reply:
            "👋 Hello! I am **SnapCut Assistant**.\n\nSnapCut AI removes image backgrounds in ~3 seconds into transparent PNGs with hair-level precision.\n\n- ⚡ **Formats**: JPG, PNG, WEBP up to 10MB & 5000×5000px Ultra HD\n- 🔒 **Privacy**: All files permanently deleted after 24 hours\n- 🎁 **Credits**: 5 free daily credits replenished automatically\n\n*Note: To connect live Gemini AI responses on Vercel, set `GEMINI_API_KEY` in Vercel Project Settings.*",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const item of rawHistory.slice(-8)) {
      if (item && typeof item === 'object') {
        const text = (item.text || item.parts?.[0]?.text || '').trim();
        if (!text) continue;
        const role =
          item.role === 'model' || item.sender === 'assistant' || item.sender === 'bot'
            ? 'model'
            : 'user';
        contents.push({
          role,
          parts: [{ text: text.slice(0, 800) }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.slice(0, 1000) }],
    });

    const CANDIDATE_MODELS = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    let reply = '';
    let lastError = '';

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SNAPCUT_SYSTEM_INSTRUCTION }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
              topP: 0.95,
            },
          }),
        });

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
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    if (!reply) {
      return new Response(
        JSON.stringify({
          error: lastError || 'AI service temporarily unavailable',
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
