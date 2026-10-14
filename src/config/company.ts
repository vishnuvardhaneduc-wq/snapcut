/** Public business details shown on Razorpay-required website pages. Match these to your KYC. */
export const company = {
  tradeName: import.meta.env.VITE_BUSINESS_TRADE_NAME || 'SnapCut AI',
  legalName: import.meta.env.VITE_BUSINESS_LEGAL_NAME || 'SnapCut AI',
  email: import.meta.env.VITE_BUSINESS_EMAIL || 'support@snapcut.ai',
  billingEmail: import.meta.env.VITE_BUSINESS_BILLING_EMAIL || 'billing@snapcut.ai',
  phone: import.meta.env.VITE_BUSINESS_PHONE || '+91 98765 43210',
  address:
    import.meta.env.VITE_BUSINESS_ADDRESS ||
    'SnapCut AI, Plot 12, Financial District, Nanakramguda, Hyderabad, Telangana 500032, India',
  website: import.meta.env.VITE_BUSINESS_WEBSITE || 'https://snapcut-five.vercel.app',
  hours: 'Monday–Saturday, 10:00 AM – 6:00 PM IST',
  gstin: import.meta.env.VITE_BUSINESS_GSTIN || '',
  supportResponse: 'Within 1 business day for billing; within 2 hours on weekdays for product support',
} as const;
