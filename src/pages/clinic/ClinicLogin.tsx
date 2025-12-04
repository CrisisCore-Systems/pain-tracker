/**
 * Clinic Login Page
 * Professional authentication interface for healthcare providers
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinicAuth } from '../../contexts/ClinicAuthContext';
import { Stethoscope, Mail, Lock, AlertCircle, Loader2, Shield, Sparkles } from 'lucide-react';

export function ClinicLogin() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useClinicAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      navigate('/clinic/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
              boxShadow: '0 15px 40px rgba(14, 165, 233, 0.3)'
            }}
          >
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Clinic Portal
          </h1>
          <p className="text-slate-400">
            Healthcare Professional Login
          </p>
        </div>

        {/* Login Card */}
        <div 
          className="rounded-2xl p-8 border border-slate-700/50 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-purple-500" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-300">
                    Login Failed
                  </p>
                  <p className="text-sm text-rose-400/80 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="doctor@clinic.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder=""
                  className="w-full pl-12 pr-16 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border-2 border-slate-600 peer-checked:border-sky-500 peer-checked:bg-sky-500 transition-all flex items-center justify-center">
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-medium text-slate-400">Demo Credentials (Development Only)</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-slate-500">
                 Physician: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">doctor@clinic.com</code>
              </p>
              <p className="text-slate-500">
                 Nurse: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">nurse@clinic.com</code>
              </p>
              <p className="text-slate-500">
                 Admin: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">admin@clinic.com</code>
              </p>
              <p className="text-slate-500">
                 Password: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400">any password</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <p className="text-sm">
              Pain Tracker Pro &copy; {new Date().getFullYear()}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            HIPAA Compliant | Secure Healthcare Portal
          </p>
        </div>
      </div>
    </div>
  );
}