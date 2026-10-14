import type { NavigateFunction } from 'react-router-dom';
import type { UserProfile } from '../types';

export interface AllowlistedRoute {
  path: string;
  name: string;
  requiresAuth: boolean;
  requiresAdmin?: boolean;
  aliases: string[];
}

/**
 * Strict allowlist of actual routes in SnapCut AI.
 * Arbitrary paths or external URLs are strictly rejected.
 */
export const ALLOWLISTED_ROUTES: Record<string, AllowlistedRoute> = {
  '/': {
    path: '/',
    name: 'Home',
    requiresAuth: false,
    aliases: ['home', 'landing', 'start', 'homepage', 'main page', 'go to home'],
  },
  '/features': {
    path: '/features',
    name: 'Features',
    requiresAuth: false,
    aliases: ['features', 'capabilities', 'what can it do', 'tools'],
  },
  '/pricing': {
    path: '/pricing',
    name: 'Pricing & Plans',
    requiresAuth: false,
    aliases: ['pricing', 'plans', 'subscriptions', 'rates', 'cost', 'how much'],
  },
  '/api-docs': {
    path: '/api-docs',
    name: 'Developer API Docs',
    requiresAuth: false,
    aliases: ['api docs', 'api', 'documentation', 'developer docs', 'docs', 'endpoints'],
  },
  '/blog': {
    path: '/blog',
    name: 'Blog',
    requiresAuth: false,
    aliases: ['blog', 'articles', 'posts', 'tutorials', 'news'],
  },
  '/about': {
    path: '/about',
    name: 'About Us',
    requiresAuth: false,
    aliases: ['about', 'about us', 'company', 'team', 'story'],
  },
  '/contact': {
    path: '/contact',
    name: 'Contact & Support',
    requiresAuth: false,
    aliases: ['contact', 'support', 'help', 'get in touch', 'customer care'],
  },
  '/privacy': {
    path: '/privacy',
    name: 'Privacy Policy',
    requiresAuth: false,
    aliases: ['privacy', 'privacy policy', 'gdpr', 'data retention'],
  },
  '/terms': {
    path: '/terms',
    name: 'Terms of Service',
    requiresAuth: false,
    aliases: ['terms', 'terms of service', 'conditions', 'tos'],
  },
  '/refund': {
    path: '/refund',
    name: 'Refund Policy',
    requiresAuth: false,
    aliases: ['refund', 'refund policy', 'cancellation', 'money back'],
  },
  '/shipping': {
    path: '/shipping',
    name: 'Shipping & Delivery',
    requiresAuth: false,
    aliases: ['shipping', 'delivery', 'fulfillment'],
  },
  '/login': {
    path: '/login',
    name: 'Sign In',
    requiresAuth: false,
    aliases: ['login', 'sign in', 'signin', 'log in'],
  },
  '/register': {
    path: '/register',
    name: 'Create Account',
    requiresAuth: false,
    aliases: ['register', 'sign up', 'signup', 'create account', 'join'],
  },
  '/forgot-password': {
    path: '/forgot-password',
    name: 'Forgot Password',
    requiresAuth: false,
    aliases: ['forgot password', 'reset password', 'recover account'],
  },
  '/app/dashboard': {
    path: '/app/dashboard',
    name: 'Dashboard',
    requiresAuth: true,
    aliases: [
      'dashboard',
      'my dashboard',
      'overview',
      'user dashboard',
      'go to dashboard',
      'open dashboard',
    ],
  },
  '/app/upload': {
    path: '/app/upload',
    name: 'Upload Studio',
    requiresAuth: true,
    aliases: [
      'upload',
      'uploads',
      'workspace',
      'studio',
      'editor',
      'remove background',
      'open my uploads',
      'go to upload',
      'upload photo',
    ],
  },
  '/app/downloads': {
    path: '/app/downloads',
    name: 'Downloads & History',
    requiresAuth: true,
    aliases: [
      'downloads',
      'history',
      'recent images',
      'my cutouts',
      'past cutouts',
      'saved images',
      'show recent images',
      'view downloads',
    ],
  },
  '/app/billing': {
    path: '/app/billing',
    name: 'Billing & Invoices',
    requiresAuth: true,
    aliases: ['billing', 'invoices', 'receipts', 'my plan', 'manage subscription'],
  },
  '/app/credits': {
    path: '/app/credits',
    name: 'Credits & Quota',
    requiresAuth: true,
    aliases: ['credits', 'buy credits', 'credit balance', 'quota', 'top up'],
  },
  '/app/api-keys': {
    path: '/app/api-keys',
    name: 'Developer API Keys',
    requiresAuth: true,
    aliases: ['api keys', 'my api keys', 'developer tokens', 'secret keys', 'access keys'],
  },
  '/app/settings': {
    path: '/app/settings',
    name: 'Account Settings',
    requiresAuth: true,
    aliases: ['settings', 'account settings', 'profile', 'preferences', 'my account', 'open settings'],
  },
  '/admin/dashboard': {
    path: '/admin/dashboard',
    name: 'Admin Dashboard',
    requiresAuth: true,
    requiresAdmin: true,
    aliases: ['admin', 'admin dashboard', 'admin overview', 'admin panel'],
  },
  '/admin/users': {
    path: '/admin/users',
    name: 'Admin User Management',
    requiresAuth: true,
    requiresAdmin: true,
    aliases: ['admin users', 'manage users', 'user list admin'],
  },
  '/admin/analytics': {
    path: '/admin/analytics',
    name: 'Admin Analytics',
    requiresAuth: true,
    requiresAdmin: true,
    aliases: ['admin analytics', 'platform analytics', 'usage stats'],
  },
  '/admin/logs': {
    path: '/admin/logs',
    name: 'Admin Audit Logs',
    requiresAuth: true,
    requiresAdmin: true,
    aliases: ['admin logs', 'audit logs', 'server logs'],
  },
  '/admin/payments': {
    path: '/admin/payments',
    name: 'Admin Payments',
    requiresAuth: true,
    requiresAdmin: true,
    aliases: ['admin payments', 'transactions admin', 'payment logs'],
  },
};

export interface AgentAction {
  type: 'NAVIGATE';
  route: string;
  label: string;
}

export interface AgentExecutionResult {
  executed: boolean;
  route?: AllowlistedRoute;
  message: string;
  redirectedToLogin?: boolean;
}

const ACTION_REGEX = /<!--ACTION:(\{.*?\})-->/s;

/**
 * Parses Gemini response to detect structured action intent, or applies local NLP fallback.
 */
export function extractAgentAction(
  rawText: string,
  userMessage?: string
): { cleanText: string; action: AgentAction | null } {
  // 1. Check for structured Gemini <!--ACTION:{...}--> tag
  const match = rawText.match(ACTION_REGEX);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && parsed.type === 'NAVIGATE' && typeof parsed.route === 'string') {
        const cleanText = rawText.replace(ACTION_REGEX, '').trim();
        const routeObj = ALLOWLISTED_ROUTES[parsed.route];
        return {
          cleanText,
          action: {
            type: 'NAVIGATE',
            route: parsed.route,
            label: routeObj?.name || parsed.label || 'Page',
          },
        };
      }
    } catch {
      // Fall through to regex cleanup
    }
  }

  const cleanText = rawText.replace(ACTION_REGEX, '').trim();

  // 2. Client-side NLP fallback if user issued an explicit navigation command
  // but Gemini or offline fallback didn't output the tag
  if (userMessage) {
    const fallbackAction = detectNavigationIntent(userMessage);
    if (fallbackAction) {
      return { cleanText, action: fallbackAction };
    }
  }

  return { cleanText, action: null };
}

/**
 * Local intent classifier for direct speech or text commands:
 * e.g., "go to dashboard", "open my uploads", "show recent images", "take me to pricing", "open settings"
 */
export function detectNavigationIntent(query: string): AgentAction | null {
  const q = query.trim().toLowerCase();

  // Action verbs that indicate navigation intent
  const isActionCommand =
    q.startsWith('go to') ||
    q.startsWith('goto') ||
    q.startsWith('open') ||
    q.startsWith('show') ||
    q.startsWith('take me to') ||
    q.startsWith('navigate to') ||
    q.startsWith('visit') ||
    q.startsWith('switch to') ||
    q.includes('go to my') ||
    q.includes('open my') ||
    q.includes('show my');

  if (!isActionCommand) {
    return null;
  }

  // Check matching allowlisted route aliases
  for (const [routePath, routeDef] of Object.entries(ALLOWLISTED_ROUTES)) {
    for (const alias of routeDef.aliases) {
      // Exact alias match or command contains alias
      if (q === alias || q.includes(alias)) {
        return {
          type: 'NAVIGATE',
          route: routePath,
          label: routeDef.name,
        };
      }
    }
  }

  return null;
}

/**
 * Validates and executes an agent action safely within React Router context.
 * Never executes arbitrary code or unallowlisted paths.
 * Strictly respects authentication and role requirements.
 */
export function executeAgentAction(
  action: AgentAction,
  context: {
    user: UserProfile | null;
    isAdmin: boolean;
    navigate: NavigateFunction;
  }
): AgentExecutionResult {
  const { user, isAdmin, navigate } = context;

  // 1. Security Check: Must exist in allowlist
  const routeDef = ALLOWLISTED_ROUTES[action.route];
  if (!routeDef) {
    return {
      executed: false,
      message: `The requested page "${action.route}" is not recognized or available.`,
    };
  }

  // 2. Authentication Check
  if (routeDef.requiresAuth && !user) {
    const loginRedirect = `/login?redirect=${encodeURIComponent(routeDef.path)}`;
    navigate(loginRedirect);
    return {
      executed: true,
      redirectedToLogin: true,
      route: routeDef,
      message: `🔒 Accessing ${routeDef.name} requires you to sign in. Redirecting to login...`,
    };
  }

  // 3. Admin Authorization Check
  if (routeDef.requiresAdmin && !isAdmin) {
    return {
      executed: false,
      route: routeDef,
      message: `⛔ The ${routeDef.name} is restricted to SnapCut AI administrators.`,
    };
  }

  // 4. Safe Navigation Execution
  navigate(routeDef.path);

  return {
    executed: true,
    route: routeDef,
    message: `🚀 Opened ${routeDef.name}`,
  };
}
