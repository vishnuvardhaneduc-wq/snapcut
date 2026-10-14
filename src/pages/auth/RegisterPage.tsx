import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/app/dashboard';

  const { setUser } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessInfo(null);
    setLoading(true);

    try {
      const response = await authService.register(fullName, email, password);
      if (response.user) {
        setUser(response.user);
        if (response.token) {
          navigate(redirectPath);
        } else {
          setSuccessInfo(response.message || 'Account created! Please check your email inbox to verify your account.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMsg(null);
    setOauthLoading(true);
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Google registration.');
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/10 to-transparent blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Logo size="lg" className="justify-center mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
          Create your SnapCut AI account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Get started with 5 free high-resolution credits every day
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Almost there!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {successInfo}
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="btn-gradient-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Google OAuth button */}
              <button
                type="button"
                disabled={oauthLoading || loading}
                onClick={handleGoogleOAuth}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#131823] border border-white/10 hover:border-white/20 text-xs sm:text-sm font-semibold text-white transition mb-6 shadow-sm disabled:opacity-50"
              >
                {oauthLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{oauthLoading ? 'Redirecting to Google...' : 'Sign up with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0D111A] px-3 text-[11px] font-mono text-slate-500 uppercase">
                  or with email
                </span>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Elena Vance"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white transition"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Plan Includes:</span>
                  </div>
                  <p>• 5 free cutouts renewed every 24 hours</p>
                  <p>• Fast cloud processing & export</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || oauthLoading}
                  className="btn-gradient-neon w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
