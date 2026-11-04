import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    setEmail('asif.shaik@helcyon.ai');
    setPassword('••••••••••••');

    const result = await signIn('asif.shaik@helcyon.ai', 'demo123456');
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Helcyon <span className="text-emerald-400 font-bold">AI</span></span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400">Access your financial intelligence dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
          {/* Quick Demo Access Button */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-emerald-300">Evaluating or Demonstrating?</div>
                <div className="text-[11px] text-slate-400">One-click sign in with synthetic data</div>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={handleDemoLogin} isLoading={isLoading}>
              Demo Sign In
            </Button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <a href="#/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
