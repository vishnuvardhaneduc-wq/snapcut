import React from 'react';
import { Link } from 'react-router-dom';
import { PolicyLayout, PolicySection } from '../../components/common/PolicyLayout';
import { company } from '../../config/company';

export const ShippingPage: React.FC = () => {
  return (
    <PolicyLayout
      kicker="Last updated: October 2026"
      title="Shipping and Delivery Policy"
      subtitle={`${company.tradeName} delivers AI background-removal software digitally. There are no physical shipments, courier partners, or shipping charges.`}
    >
      <PolicySection title="1. Digital-only delivery">
        <p>
          {company.tradeName} ({company.legalName}) provides an online image-processing service: upload a photo, remove the
          background with our AI models, and download a transparent PNG. We do not manufacture, warehouse, or ship
          physical products. International courier timelines, packing, and freight costs do not apply.
        </p>
      </PolicySection>

      <PolicySection title="2. When you receive the service">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Free and paid processing:</strong> cutouts are generated in the web workspace
            usually within a few seconds after upload. You can download the PNG immediately.
          </li>
          <li>
            <strong className="text-white">Paid plans and credit packs:</strong> after a successful Razorpay payment,
            entitlements appear on your account instantly. No waiting period and no shipping confirmation email for
            goods — only a Razorpay payment receipt.
          </li>
          <li>
            <strong className="text-white">Temporary file storage:</strong> originals and outputs are kept for up to 24
            hours so you can re-download, then they are automatically deleted.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Delivery failures">
        <p>
          If payment succeeds but credits or Pro access are missing, or a job fails after credits were deducted, contact{' '}
          <a className="text-cyan-400" href={`mailto:${company.email}`}>
            {company.email}
          </a>{' '}
          or {company.phone}. We will restore access or refund as described in our{' '}
          <Link to="/refund" className="text-cyan-400">
            Refund and Cancellation Policy
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="4. Service geography">
        <p>
          The website {company.website} is operated from India. The software is available online wherever you have a
          supported browser. We do not levy shipping fees by country. Applicable GST (if any) is included in the INR
          prices shown at checkout unless stated otherwise.
        </p>
      </PolicySection>

      <PolicySection title="5. Business address (for correspondence)">
        <p>
          {company.legalName}
          <br />
          {company.address}
          <br />
          Phone: {company.phone}
          <br />
          Email: {company.email}
        </p>
      </PolicySection>
    </PolicyLayout>
  );
};
