import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { Mail, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Logo size="lg" className="justify-center mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
          Verify your email address
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          We've dispatched an activation link to your inbox.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <Mail className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              Please open your email inbox and click the verification link to confirm your account and activate your 5 free daily credits.
            </p>
            <p className="text-slate-500 text-xs">
              Didn't receive the email? Check your spam folder or allow up to 2 minutes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="btn-gradient-primary w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
