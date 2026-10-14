// Supabase Edge Function: chat
// Secure Gemini AI Chatbot integration for SnapCut AI
// Deno TypeScript Runtime

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting map for basic abuse prevention (per IP, max 20 requests/min)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

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

AGENTIC ACTIONS & WEBSITE NAVIGATION:
You are an agentic assistant capable of directly navigating users to pages in SnapCut AI.
When the user explicitly asks to go to, open, visit, navigate to, or view a page (e.g., "go to dashboard", "open my uploads", "show recent images", "take me to pricing", "open settings"), append a single structured action tag at the very end of your response:
<!--ACTION:{"type":"NAVIGATE","route":"<ROUTE_PATH>","label":"<PAGE_NAME>"}-->

Allowlisted Route Paths:
- "/" (Home / Landing)
- "/features" (Features)
- "/pricing" (Pricing & Plans)
- "/api-docs" (Developer API Docs)
- "/blog" (Blog Articles)
- "/about" (About Us)
- "/contact" (Contact & Support)
- "/privacy" (Privacy Policy)
- "/terms" (Terms of Service)
- "/refund" (Refund Policy)
- "/shipping" (Shipping & Delivery)
- "/login" (Sign In)
- "/register" (Sign Up / Register)
- "/forgot-password" (Forgot Password)
- "/app/dashboard" (User Dashboard)
- "/app/upload" (Upload Studio / Workspace)
- "/app/downloads" (Downloads & 24h History)
- "/app/billing" (Billing & Invoices)
- "/app/credits" (Credit Balance & Purchases)
- "/app/api-keys" (Developer API Keys)
- "/app/settings" (Account & Profile Settings)
- "/admin/dashboard" (Admin Dashboard)
- "/admin/users" (Admin User Management)
- "/admin/analytics" (Admin Analytics)
- "/admin/logs" (Admin Audit Logs)
- "/admin/payments" (Admin Payments)

NAVIGATION RULES:
1. ONLY emit an ACTION tag when the user explicitly requests navigation or opening a page.
2. For purely informational questions (e.g., "what formats are supported?", "how do credits work?"), DO NOT emit an ACTION tag.
3. If the user asks for a page that does not exist in SnapCut AI, politely clarify and do NOT output an ACTION tag.
4. When emitting an action tag, include a friendly confirmation sentence (e.g., "Taking you to your Dashboard now!").
`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting check
  const clientIp = req.headers.get('cf-connecting-ip') ||
                   req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait a minute before sending another message.',
      }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // 1. Check Gemini API Key server secret
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error:
            'GEMINI_API_KEY secret is not configured on Supabase. Run "supabase secrets set GEMINI_API_KEY=your_key" to enable the chatbot.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Validate request body
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: "message" field is required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userMessage = body.message.trim();
    if (userMessage.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (userMessage.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Message exceeds maximum length of 1,000 characters.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Format conversation history for Gemini API
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    // Limit history to last 10 messages to avoid token bloat
    const recentHistory = rawHistory.slice(-10);

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const item of recentHistory) {
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

    // Append the current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // 4. Call Google Gemini API with multi-model cascade
    const CANDIDATE_MODELS = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    let replyText = '';
    let lastErrorMsg = '';

    for (const model of CANDIDATE_MODELS) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
        const geminiPayload = {
          systemInstruction: {
            parts: [{ text: SNAPCUT_SYSTEM_INSTRUCTION }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
            topP: 0.95,
          },
        };

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            replyText = text;
            break;
          }
        } else {
          const errData = await geminiRes.json().catch(() => ({}));
          lastErrorMsg = errData.error?.message || `Status ${geminiRes.status}`;
          console.warn(`Model ${model} issue: ${lastErrorMsg}. Trying next candidate...`);
        }
      } catch (err: unknown) {
        lastErrorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Model ${model} fetch failure: ${lastErrorMsg}. Trying next candidate...`);
      }
    }

    if (!replyText) {
      return new Response(
        JSON.stringify({
          error: `AI service temporarily unavailable: ${lastErrorMsg}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Unexpected error in chat function:', error);
    return new Response(
      JSON.stringify({
        error: 'An internal error occurred while processing your request.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
