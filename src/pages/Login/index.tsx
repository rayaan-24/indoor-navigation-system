import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      
      // Admin bypass
      if (email === 'admin@indoornav.com') {
        localStorage.setItem('userName', 'Admin User');
        navigate('/admin');
      } else {
        localStorage.setItem('userName', email.split('@')[0]);
        navigate('/profile');
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-md space-y-6">
        
        {/* Header Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-primary">Sign in to IndoorNav</h2>
          <p className="text-brand-muted text-xs mt-2">Access your favorite locations and route history.</p>
        </div>

        {/* Demo Credentials Alert */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-brand-primary">
          <p className="font-bold flex items-center mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-secondary mr-1" />
            Phase 1 Frontend Mocks Available:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-brand-muted">
            <li>Admin Console: <strong className="text-brand-secondary">admin@indoornav.com</strong> (pass: 123456)</li>
            <li>Student Profile: <strong className="text-brand-secondary">student@campus.edu</strong> (pass: 123456)</li>
          </ul>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Email Address</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Password</label>
              <a href="#forgot" className="text-[10px] font-bold text-brand-secondary hover:underline">Forgot password?</a>
            </div>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white">
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

          {/* Remember me checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-secondary focus:ring-brand-secondary"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-brand-primary select-none cursor-pointer">
              Remember my session
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2.5 px-4 text-sm shadow hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-brand-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-secondary hover:underline">
              Create one here.
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
