import { supabase } from '../lib/supabase';
import { extractAgentAction, type AgentAction } from './agentActionService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
  action?: AgentAction | null;
  actionExecuted?: boolean;
}

export interface ChatServiceResponse {
  reply: string;
  action: AgentAction | null;
}

// Client-side rate-limiting and throttle state
let lastMessageTime = 0;
const MIN_COOLDOWN_MS = 600; // fast responsive cooldown
const MAX_MESSAGES_PER_SESSION = 50;
let sessionMessageCount = 0;

/**
 * Validates and sends a user message to the Gemini-powered SnapCut agentic service.
 * Supports natural language queries and agentic site navigation commands.
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<ChatServiceResponse> {
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
  // In dev, use local proxy. In production, use Supabase Edge Function first, then Vercel /api/chat.
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
          const { cleanText, action } = extractAgentAction(localData.reply, trimmed);
          return { reply: cleanText, action };
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
      const { cleanText, action } = extractAgentAction(data.reply, trimmed);
      return { reply: cleanText, action };
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
          const { cleanText, action } = extractAgentAction(localData.reply, trimmed);
          return { reply: cleanText, action };
        }
      }
    } catch (localErr: any) {
      console.warn('Fallback /api/chat notice:', localErr.message || localErr);
    }
  }

  // 4. Structured agentic fallback if remote services are unreachable
  return generateHelpfulFallback(trimmed);
}

/**
 * Immediate, high-accuracy domain answers and agentic navigation intent resolution
 * if the remote AI service is temporarily offline or unavailable.
 */
function generateHelpfulFallback(query: string): ChatServiceResponse {
  const { action } = extractAgentAction('', query);

  if (action) {
    return {
      reply: `Certainly! Navigating to **${action.label}**...`,
      action,
    };
  }

  const q = query.toLowerCase();

  if (q.includes('format') || q.includes('size') || q.includes('resolution') || q.includes('hd')) {
    return {
      reply:
        "🖼️ **Supported Formats & Limits:**\n\n" +
        "- **File Formats**: JPG, JPEG, PNG, and WEBP.\n" +
        "- **Max File Size**: Up to 10MB per image.\n" +
        "- **Max Resolution**: Up to Ultra HD 5000×5000px (25 megapixels).\n" +
        "- **Output**: Transparent, high-fidelity PNG.",
      action: null,
    };
  }

  if (q.includes('credit') || q.includes('price') || q.includes('plan') || q.includes('free') || q.includes('cost')) {
    return {
      reply:
        "💳 **SnapCut AI Credits & Plans:**\n\n" +
        "- **Free Plan**: 5 credits every day, replenished automatically.\n" +
        "- **Pro Creator**: 100 credits/mo, priority AI queue, and batch processing.\n" +
        "- **Scale & Studio**: 500 credits/mo, dedicated AI worker, and unlimited REST API.\n" +
        "- **Credit Packs**: Pay-as-you-go packs starting at 25 credits that never expire.\n\n" +
        "Say **'open pricing'** or **'open credits'** to view your balance and upgrade!",
      action: null,
    };
  }

  if (q.includes('privac') || q.includes('delete') || q.includes('save') || q.includes('store') || q.includes('24')) {
    return {
      reply:
        "🔒 **Privacy & 24-Hour Auto-Purge:**\n\n" +
        "SnapCut AI enforces a strict zero-retention privacy policy. Uploaded images and generated transparent cutouts are **automatically and permanently destroyed after 24 hours** via Cloudinary lifecycle rules and background cron jobs.",
      action: null,
    };
  }

  if (q.includes('api') || q.includes('curl') || q.includes('python') || q.includes('node') || q.includes('key')) {
    return {
      reply:
        "⚡ **Developer REST API:**\n\n" +
        "You can integrate SnapCut AI with a simple HTTP POST request:\n" +
        "- **Endpoint**: `https://api.snapcut.ai/v1/remove`\n" +
        "- **Header**: `X-API-Key: sc_live_your_key`\n" +
        "- Say **'open api docs'** to read the documentation, or **'open api keys'** to generate your secret tokens!",
      action: null,
    };
  }

  return {
    reply:
      "👋 Hello! I am **SnapCut Assistant**, your agentic website guide.\n\n" +
      "You can ask me questions or command me with your voice or keyboard:\n" +
      "- 🚀 *\"Go to dashboard\"*\n" +
      "- ✂️ *\"Open my uploads\"*\n" +
      "- 🖼️ *\"Show recent images\"*\n" +
      "- 💳 *\"View pricing & plans\"*\n" +
      "- ⚙️ *\"Open settings\"*\n" +
      "- 🔑 *\"Show my API keys\"*\n\n" +
      "Where would you like to go today?",
    action: null,
  };
}
