import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authContent } from '../content/authContent';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const { login: content } = authContent;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">

        {/* Header Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-primary">{content.title}</h2>
          <p className="text-brand-muted text-xs mt-2">{content.subtitle}</p>
        </div>

        {/* Redirect Message Notice */}
        {redirectMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold text-center animate-fade-in flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{redirectMessage}</span>
          </div>
        )}

        {/* Credentials Alert */}
        <div className="p-3 bg-yellow-50/80 border border-yellow-200 rounded-xl text-[11px] text-brand-primary space-y-2">
          <div>
            <p className="font-bold flex items-center mb-1 text-amber-900">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 mr-1.5 flex-shrink-0" />
              {content.mandatoryAuth.title}
            </p>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {content.mandatoryAuth.description}
            </p>
          </div>
          <div className="border-t border-yellow-200 pt-1.5">
            <p className="font-semibold text-[10px] text-slate-700 mb-1">{content.demoAccounts.title}</p>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
              <li>{content.demoAccounts.admin.label}: <strong className="text-amber-800">{content.demoAccounts.admin.email}</strong> (pass: <span className="font-mono text-amber-900 font-semibold">{content.demoAccounts.admin.password}</span>)</li>
              <li>{content.demoAccounts.student.label}: <strong className="text-amber-800">{content.demoAccounts.student.email}</strong> (pass: <span className="font-mono text-amber-900 font-semibold">{content.demoAccounts.student.password}</span>)</li>
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
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">{content.fields.emailLabel}</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-400/20 px-3 py-2 bg-slate-50 focus-within:bg-white transition-all">
              <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="email"
                placeholder={content.fields.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {errors.email && <span className="text-[11px] text-red-600 font-medium block mt-1">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">{content.fields.passwordLabel}</label>
              <a href="#forgot" className="text-[10px] text-amber-700 hover:underline font-semibold">{content.fields.forgotPasswordText}</a>
            </div>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-400/20 px-3 py-2 bg-slate-50 focus-within:bg-white transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={content.fields.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none pr-7"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 text-slate-400 hover:text-amber-700 rounded transition-colors cursor-pointer flex-shrink-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-[11px] text-red-600 font-medium block mt-1">{errors.password}</span>}

            {/* Real-time Password Criteria Checklist */}
            {password.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 mt-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Password Criteria
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${[
                        password.length >= 8,
                        /[A-Z]/.test(password),
                        /[a-z]/.test(password),
                        /[0-9]/.test(password),
                        /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;~`']|[^A-Za-z0-9\s]/.test(password)
                      ].every(Boolean)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-yellow-100 text-amber-900 border border-yellow-300'
                      }`}
                  >
                    {[
                      password.length >= 8,
                      /[A-Z]/.test(password),
                      /[a-z]/.test(password),
                      /[0-9]/.test(password),
                      /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;~`']|[^A-Za-z0-9\s]/.test(password)
                    ].filter(Boolean).length} / 5 Met
                  </span>
                </div>
                <ul className="space-y-1">
                  {[
                    { id: 'len', label: 'Minimum 8 characters', met: password.length >= 8 },
                    { id: 'upper', label: 'At least 1 uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
                    { id: 'lower', label: 'At least 1 lowercase letter (a-z)', met: /[a-z]/.test(password) },
                    { id: 'num', label: 'At least 1 number (0-9)', met: /[0-9]/.test(password) },
                    { id: 'sym', label: 'At least 1 special symbol (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;~`']|[^A-Za-z0-9\s]/.test(password) }
                  ].map((criterion) => (
                    <li
                      key={criterion.id}
                      className={`flex items-center text-[11px] transition-colors ${criterion.met ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                        }`}
                    >
                      {criterion.met ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5 flex-shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 ml-1 flex-shrink-0" />
                      )}
                      <span>{criterion.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-brand-secondary text-slate-900 font-bold py-3 px-4 text-sm shadow-xs hover:bg-yellow-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? content.submittingText : content.submitButton}
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="text-center pt-2 text-xs">
          <span className="text-brand-muted">{content.switchPrompt} </span>
          <Link to="/register" className="font-bold text-brand-secondary hover:underline">{content.switchLinkText}</Link>
        </div>

      </div>
    </div>
  );
}
