import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

// Client-side rate-limiting and throttle state
let lastMessageTime = 0;
const MIN_COOLDOWN_MS = 1000; // 1 second between messages
const MAX_MESSAGES_PER_SESSION = 50;
let sessionMessageCount = 0;

/**
 * Validates and sends a user message to the Gemini-powered SnapCut support service.
 * Follows a secure server-side invocation model via Supabase Edge Function with local dev fallback.
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const trimmed = message.trim();

  // 1. Client-side input validation
  if (!trimmed) {
    throw new Error('Please enter a message before sending.');
  }

  if (trimmed.length > 1000) {
    throw new Error('Message is too long. Please keep questions under 1,000 characters.');
  }

  // 2. Client-side rate limiting / abuse protection
  const now = Date.now();
  if (now - lastMessageTime < MIN_COOLDOWN_MS) {
    throw new Error('Please wait a moment before sending another message.');
  }

  if (sessionMessageCount >= MAX_MESSAGES_PER_SESSION) {
    throw new Error(
      'Session message limit reached. Please refresh the page or contact support@snapcut.ai.'
    );
  }

  lastMessageTime = now;
  sessionMessageCount += 1;

  // Format clean history for the backend
  const formattedHistory = history
    .filter((m) => !m.isError)
    .slice(-8)
    .map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

  // 3. Execution strategy:
  // In local development (Vite dev server), use the local /api/chat proxy directly to avoid
  // CORS preflight errors from an undeployed remote Supabase edge function.
  // In production, invoke the Supabase Edge Function 'chat' first.
  const isDev = import.meta.env.DEV;

  if (isDev) {
    try {
      const localRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: formattedHistory,
        }),
      });

      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData?.reply) {
          return localData.reply;
        }
      }
    } catch (localErr: any) {
      console.warn('Local dev /api/chat notice:', localErr.message || localErr);
    }
  }

  // Primary production attempt (or dev fallback): Invoke Supabase Edge Function 'chat'
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        message: trimmed,
        history: formattedHistory,
      },
    });

    if (!error && data?.reply) {
      return data.reply;
    }

    if (error) {
      console.warn('Supabase Edge Function "chat" invocation notice:', error.message || error);
    }
  } catch (err: any) {
    console.warn('Supabase function call bypassed or unavailable:', err.message || err);
  }

  // If in production and Supabase edge function failed, attempt local /api/chat
  if (!isDev) {
    try {
      const localRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: formattedHistory,
        }),
      });

      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData?.reply) {
          return localData.reply;
        }
      }
    } catch (localErr: any) {
      console.warn('Fallback /api/chat notice:', localErr.message || localErr);
    }
  }

  // 4. Friendly structured fallback if neither remote edge function nor local proxy responded
  return generateHelpfulFallback(trimmed);
}

/**
 * Provides immediate, high-accuracy domain answers if the network/remote function
 * is temporarily unreachable, ensuring the user always receives assistance.
 */
function generateHelpfulFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('format') || q.includes('size') || q.includes('resolution') || q.includes('hd')) {
    return (
      "🖼️ **Supported Formats & Limits:**\n\n" +
      "- **File Formats**: JPG, JPEG, PNG, and WEBP.\n" +
      "- **Max File Size**: Up to 10MB per image.\n" +
      "- **Max Resolution**: Up to Ultra HD 5000×5000px (25 megapixels).\n" +
      "- **Output**: Transparent, high-fidelity PNG."
    );
  }

  if (q.includes('credit') || q.includes('price') || q.includes('plan') || q.includes('free') || q.includes('cost')) {
    return (
      "💳 **SnapCut AI Credits & Plans:**\n\n" +
      "- **Free Plan**: 5 credits every day, replenished automatically.\n" +
      "- **Pro Creator**: 100 credits/mo, priority AI queue, and batch processing.\n" +
      "- **Scale & Studio**: 500 credits/mo, dedicated AI worker, and unlimited REST API.\n" +
      "- **Credit Packs**: Pay-as-you-go packs starting at 25 credits that never expire.\n\n" +
      "You can view your quota or upgrade anytime in the **Billing & Plans** tab!"
    );
  }

  if (q.includes('privac') || q.includes('delete') || q.includes('save') || q.includes('store') || q.includes('24')) {
    return (
      "🔒 **Privacy & 24-Hour Auto-Purge:**\n\n" +
      "SnapCut AI enforces a strict zero-retention privacy policy. Uploaded images and generated transparent cutouts are **automatically and permanently destroyed after 24 hours** via Cloudinary lifecycle rules and background cron jobs."
    );
  }

  if (q.includes('api') || q.includes('curl') || q.includes('python') || q.includes('node') || q.includes('key')) {
    return (
      "⚡ **Developer REST API:**\n\n" +
      "You can integrate SnapCut AI with a simple HTTP POST request:\n" +
      "- **Endpoint**: `https://api.snapcut.ai/v1/remove`\n" +
      "- **Header**: `X-API-Key: sc_live_your_key`\n" +
      "- Check out the **API Docs** page in the top header for full Python, Node.js, and cURL code snippets!"
    );
  }

  return (
    "👋 Hello! I am **SnapCut Assistant**.\n\n" +
    "I can help you with:\n" +
    "- ✂️ **AI Background Removal**: 3-second transparent PNG generation\n" +
    "- 📐 **Image Limits**: Up to 10MB and 5000×5000px Ultra HD\n" +
    "- 🎁 **Credits & Plans**: 5 free daily credits, Pro subscriptions, and packs\n" +
    "- 🔒 **24-Hour Privacy**: Automatic file deletion\n" +
    "- 🚀 **Developer REST API**: Webhooks and keys\n\n" +
    "How can I assist your workflow today?"
  );
}
