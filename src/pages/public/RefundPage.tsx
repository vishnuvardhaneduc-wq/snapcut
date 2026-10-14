import React from 'react';
import { Link } from 'react-router-dom';
import { PolicyLayout, PolicySection } from '../../components/common/PolicyLayout';
import { company } from '../../config/company';

export const RefundPage: React.FC = () => {
  return (
    <PolicyLayout
      kicker="Last updated: October 2026"
      title="Refund and Cancellation Policy"
      subtitle={`${company.tradeName} sells digital AI background-removal credits and software subscriptions. This policy explains how cancellations, refunds, and chargebacks work for payments collected through Razorpay.`}
    >
      <PolicySection title="1. Nature of the product">
        <p>
          {company.tradeName} is a software-as-a-service platform. We do not sell physical goods. When you pay, you
          receive instant digital access: monthly plan entitlements (Pro Creator or Scale & Studio) or a pack of
          never-expiring processing credits used to generate transparent PNG cutouts.
        </p>
      </PolicySection>

      <PolicySection title="2. Instant digital delivery">
        <p>
          After Razorpay confirms a successful payment, credits or plan access are applied to your SnapCut AI account
          immediately (typically within a few seconds). Because the service is delivered electronically, there is no
          courier, unboxing, or return-to-warehouse process.
        </p>
      </PolicySection>

      <PolicySection title="3. Subscription cancellation">
        <p>
          You may cancel a monthly subscription at any time from Billing inside the app, or by emailing{' '}
          <a className="text-cyan-400" href={`mailto:${company.billingEmail}`}>
            {company.billingEmail}
          </a>
          . Cancellation stops the next Razorpay auto-debit. You keep access until the end of the already-paid billing
          period. We do not charge a cancellation fee.
        </p>
      </PolicySection>

      <PolicySection title="4. Refund eligibility">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">7-day money-back on first Pro subscription:</strong> if you purchased Pro
            Creator for the first time, used fewer than 25 credits, and are unsatisfied with cutout quality, email us
            within 7 days of payment for a full refund of that cycle.
          </li>
          <li>
            <strong className="text-white">Duplicate or failed charges:</strong> if Razorpay deducted money more than
            once, or a payment succeeded but credits/plan were not applied, we refund the extra or failed entitlement
            within 5–7 business days after verification.
          </li>
          <li>
            <strong className="text-white">Unused credit packs:</strong> credit packs may be refunded within 48 hours of
            purchase if zero credits from that pack have been consumed.
          </li>
          <li>
            <strong className="text-white">Not eligible:</strong> refunds are not issued for consumed credits, completed
            background-removal jobs, or dissatisfaction after extensive usage of the AI output, except as required by
            applicable consumer law.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="5. How to request a refund">
        <p>Email {company.billingEmail} with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Registered account email</li>
          <li>Razorpay payment ID (starts with pay_) or order ID (starts with order_)</li>
          <li>Date and amount paid</li>
          <li>Reason for the request</li>
        </ul>
        <p>
          You can also write to us from the <Link to="/contact" className="text-cyan-400">Contact Us</Link> page or call{' '}
          {company.phone} during {company.hours}.
        </p>
      </PolicySection>

      <PolicySection title="6. Refund timeline">
        <p>
          Approved refunds are initiated on Razorpay within 5–7 business days of confirmation. Banks and UPI apps may
          take an additional 5–7 business days to show the credit. We will email you the Razorpay refund reference.
        </p>
      </PolicySection>

      <PolicySection title="7. Chargebacks">
        <p>
          Please contact {company.tradeName} before raising a bank chargeback so we can resolve the issue faster. Unjustified
          chargebacks may lead to account suspension while the dispute is investigated.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
};
