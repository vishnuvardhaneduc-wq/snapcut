import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Link } from 'react-router-dom';
import { Terminal, Copy, Check, Key, Cpu } from 'lucide-react';

const SAMPLE_EXPIRY_DATE = '2026-10-08T14:30:00.000Z';

export const ApiDocsPage: React.FC = () => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'curl' | 'node' | 'python'>('curl');

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const curlCode = `curl -X POST https://api.snapcut.ai/v1/remove \\
  -H "X-API-Key: sc_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/photo.jpg",
    "format": "png",
    "crop": true
  }'`;

  const nodeCode = `import axios from 'axios';

const response = await axios.post(
  'https://api.snapcut.ai/v1/remove',
  {
    image_url: 'https://example.com/photo.jpg',
    format: 'png',
  },
  {
    headers: {
      'X-API-Key': 'sc_live_your_api_key_here',
      'Content-Type': 'application/json',
    },
  }
);

console.log('Cutout PNG URL:', response.data.processedUrl);`;

  const pythonCode = `import requests

url = "https://api.snapcut.ai/v1/remove"
headers = {
    "X-API-Key": "sc_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "image_url": "https://example.com/photo.jpg",
    "format": "png"
}

response = requests.post(url, json=payload, headers=headers)
print("Cutout URL:", response.json().get("processedUrl"))`;

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      <Navbar />

      <section className="pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Left Col: Documentation Text */}
            <div className="flex-1 space-y-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Developer API v1.0</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
                  SnapCut Developer API
                </h1>
                <p className="mt-4 text-slate-400 text-base leading-relaxed">
                  Integrate high-speed neural background removal directly into your applications, SaaS tools, and automated pipelines with our RESTful endpoints.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <Link
                    to="/app/api-keys"
                    className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Get API Key</span>
                  </Link>
                </div>
              </div>

              {/* Authentication */}
              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-3">
                <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  Authentication
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Authenticate requests by passing your live API key in the <code className="text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">X-API-Key</code> request header.
                </p>
              </div>

              {/* Rate Limits */}
              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-3">
                <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  Rate Limits & Concurrency
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Free tier keys are limited to 10 requests / minute. Pro accounts enjoy 60 requests / minute, and Scale & Enterprise keys support up to 10,000 requests / minute.
                </p>
              </div>

              {/* Response Codes */}
              <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white font-['Outfit']">HTTP Status Codes</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 text-emerald-300">
                    <span className="font-mono font-bold">200 OK</span>
                    <span>Image background removed successfully</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 text-amber-300">
                    <span className="font-mono font-bold">401 Unauthorized</span>
                    <span>Invalid or inactive API key</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 text-rose-300">
                    <span className="font-mono font-bold">413 Payload Too Large</span>
                    <span>Image exceeds 10MB or 5000×5000px</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 text-rose-300">
                    <span className="font-mono font-bold">429 Rate Limited</span>
                    <span>Too many requests per minute</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: Code Playground Box */}
            <div className="w-full lg:w-[540px] sticky top-28">
              <div className="rounded-2xl bg-[#0D111A] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,254,0.1)] overflow-hidden">
                
                {/* Tab Switcher */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#07090e] border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveLang('curl')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                        activeLang === 'curl' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setActiveLang('node')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                        activeLang === 'node' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Node.js
                    </button>
                    <button
                      onClick={() => setActiveLang('python')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                        activeLang === 'python' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Python
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const code = activeLang === 'curl' ? curlCode : activeLang === 'node' ? nodeCode : pythonCode;
                      copyCode(code, 'playground');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Copy Snippet"
                  >
                    {copiedTab === 'playground' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Code Body */}
                <div className="p-5 font-mono text-xs text-slate-200 overflow-x-auto max-h-[380px] bg-[#07090e]">
                  <pre>
                    {activeLang === 'curl' && curlCode}
                    {activeLang === 'node' && nodeCode}
                    {activeLang === 'python' && pythonCode}
                  </pre>
                </div>

                {/* Sample JSON Response */}
                <div className="p-4 bg-[#090C12] border-t border-white/5">
                  <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                    <span>Sample JSON Response (200 OK)</span>
                    <span className="text-emerald-400">1,240 ms</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-[#07090e] border border-white/5 font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`{
  "success": true,
  "uploadId": "upl_892182049",
  "processedUrl": "https://res.cloudinary.com/demo/image/upload/v1/cutout.png",
  "expiresAt": "${SAMPLE_EXPIRY_DATE}",
  "processingTimeMs": 1240
}`}
                  </pre>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
