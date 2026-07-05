import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Link2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';

const WELCOME_LINES = [
  { text: 'Welcome to Assignment Alumni!', isBold: true },
  { text: "The world's elite, globally accessible academic earnings ecosystem.", isBold: false },
  { text: 'The premier alternative for top freelancers from Upwork, Fiverr, and Freelancer.', isBold: false, highlights: ['Upwork', 'Fiverr', 'Freelancer'] },
  { text: 'Verified and fully registered under the Australian National University (ANU).', isBold: false, highlight: 'ANU' },
  { text: 'Turn your high-tier intellectual skills into guaranteed daily payouts worldwide.', isBold: false },
  { text: 'Secure $1.70 per submission and fast-track growth with $5.00 activation bonuses!', isBold: false, highlights: ['$1.70', '$5.00'] },
];

export function RegisterPage() {
  const { isDark } = useTheme();
  const { signup } = useGlobalState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract referral code from URL
  const referralCode = useMemo(() => searchParams.get('ref'), [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });

  const glassClass = isDark ? 'glass-dark' : 'glass-light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await signup(form.fullName, form.username, form.email, form.password, referralCode);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} flex items-center justify-center p-4 relative overflow-hidden`}>
      {isDark && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>
      )}

      <div className="max-w-lg w-full relative z-10">
        <div className={`${glassClass} p-6 sm:p-8`}>

          {/* Brand header */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'} mb-4`}>
              <span className={`text-2xl font-bold ${isDark ? 'text-neon-pink glow-text' : 'text-neon-pink'}`}>A</span>
            </div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Account
            </h1>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Join the Premium Academic Network
            </p>
          </div>

          {/* Welcome Hero */}
          <div className={`rounded-xl px-5 py-6 mb-6 border text-center ${isDark ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50/70 border-slate-200'}`}>
            <div className="space-y-3">
              {WELCOME_LINES.map((line, i) => {
                const renderText = () => {
                  if (line.highlights && line.highlights.length > 0) {
                    let result = line.text;
                    line.highlights.forEach(h => {
                      result = result.replace(h, `{{HIGHLIGHT:${h}}}`);
                    });
                    const parts = result.split(/{{HIGHLIGHT:([^}]+)}}/);
                    return parts.map((part, idx) => {
                      if (line.highlights!.includes(part)) {
                        return <span key={idx} className="font-bold text-neon-pink">{part}</span>;
                      }
                      return part;
                    });
                  }
                  if (line.highlight) {
                    const parts = line.text.split(line.highlight);
                    return (
                      <>
                        {parts[0]}
                        <span className="font-bold text-neon-pink">{line.highlight}</span>
                        {parts[1]}
                      </>
                    );
                  }
                  return line.text;
                };
                return (
                  <p
                    key={i}
                    className={`text-sm leading-relaxed ${line.isBold ? 'font-bold text-base' : ''} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    {renderText()}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Referral display */}
          {referralCode && (
            <div className={`rounded-xl px-4 py-3 mb-6 border flex items-center gap-3 ${isDark ? 'bg-neon-pink/5 border-neon-pink/20' : 'bg-neon-pink/5 border-neon-pink/20'}`}>
              <Link2 className="w-4 h-4 text-neon-pink flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Invited By:</p>
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  disabled
                  className={`w-full bg-transparent text-sm font-bold text-neon-pink outline-none cursor-default ${isDark ? 'placeholder-gray-600' : 'placeholder-gray-400'}`}
                />
              </div>
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div
              className="mb-4 p-4 rounded-xl flex items-center gap-3 border-2 animate-shake"
              style={{
                background: isDark ? 'rgba(255, 0, 60, 0.12)' : 'rgba(255, 0, 60, 0.08)',
                borderColor: '#FF003C',
                boxShadow: '0 0 20px rgba(255, 0, 60, 0.4), inset 0 0 10px rgba(255, 0, 60, 0.1)',
              }}
            >
              <div
                className="p-1.5 rounded-lg flex-shrink-0"
                style={{ background: 'rgba(255, 0, 60, 0.2)' }}
              >
                <AlertCircle className="w-5 h-5" style={{ color: '#FF1744' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#FF1744' }}>
                {error}
              </p>
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-pink/50'
                      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                  } outline-none transition-all`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Choose a unique username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-pink/50'
                      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                  } outline-none transition-all`}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-pink/50'
                      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                  } outline-none transition-all`}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-pink/50'
                      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                  } outline-none transition-all`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${isDark ? 'btn-neon-dark' : 'btn-neon-light'} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <a href="/" className="text-neon-pink font-medium hover:underline">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
