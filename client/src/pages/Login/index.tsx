import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = (location.state as any)?.message;

  // If already authenticated, redirect to destination or home/admin
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Enter a valid email address.';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirect user back to the route they originally tried to access, or default based on role
        const origin = (location.state as any)?.from?.pathname;
        if (res.data.role === 'admin') {
          navigate(origin || '/admin');
        } else {
          navigate(origin || '/');
        }
      }
    } catch (err: any) {
      console.error('Login submit error:', err);
      const errMsg = err.response?.data?.message || 'Invalid email or password. Please verify credentials.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-md space-y-6">
        
        {/* Header Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-primary">Sign in to IndoorNav</h2>
          <p className="text-brand-muted text-xs mt-2">Access your favorite locations and route history.</p>
        </div>

        {/* Redirect Message Notice */}
        {redirectMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold text-center animate-fade-in flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{redirectMessage}</span>
          </div>
        )}

        {/* Credentials Alert */}
        <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-lg text-[11px] text-brand-primary space-y-2">
          <div>
            <p className="font-bold flex items-center mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-secondary mr-1 flex-shrink-0" />
              Authentication Mandatory:
            </p>
            <p className="text-[10px] text-brand-muted leading-relaxed">
              Verified authentication is required to bookmark campus favorites, record your private route history, and access saved navigation preferences.
            </p>
          </div>
          <div className="border-t border-blue-100 pt-1.5">
            <p className="font-semibold text-[10px] text-slate-700 mb-1">Verifiable Campus Accounts:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-brand-muted">
              <li>Admin Console: <strong className="text-brand-secondary">admin@indoornav.com</strong> (pass: <span className="font-mono text-brand-secondary font-semibold">IndoorNav@123</span>)</li>
              <li>Student Profile: <strong className="text-brand-secondary">student@campus.edu</strong> (pass: <span className="font-mono text-brand-secondary font-semibold">IndoorNav@123</span>)</li>
            </ul>
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-100 text-brand-accent-dest rounded-lg text-xs font-semibold text-center animate-fade-in">
            {submitError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Email Address</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white transition-colors">
              <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="email"
                placeholder="you@campus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {errors.email && <span className="text-[10px] text-brand-accent-dest font-semibold">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Password</label>
              <a href="#forgot" className="text-[10px] text-brand-secondary hover:underline font-semibold">Forgot?</a>
            </div>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white transition-colors">
              <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {errors.password && <span className="text-[10px] text-brand-accent-dest font-semibold">{errors.password}</span>}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-3 px-4 text-sm shadow hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="text-center pt-2 text-xs">
          <span className="text-brand-muted">New to campus? </span>
          <Link to="/register" className="font-bold text-brand-secondary hover:underline">Create an Account</Link>
        </div>

      </div>
    </div>
  );
}
