import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const tempErrors: typeof errors = {};
    
    if (!fullName.trim()) {
      tempErrors.fullName = 'Full Name is required.';
    }
    
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
    
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', fullName);
      navigate('/profile');
    }, 1000);
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-md space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-primary">Create an Account</h2>
          <p className="text-brand-muted text-xs mt-2">Get started with personalized indoor navigation.</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Full Name</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white">
              <User className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {errors.fullName && <span className="text-[10px] text-brand-accent-dest font-semibold">{errors.fullName}</span>}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Email Address</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white">
              <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="email"
                placeholder="jane@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {errors.email && <span className="text-[10px] text-brand-accent-dest font-semibold">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Password</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white">
              <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {errors.password && <span className="text-[10px] text-brand-accent-dest font-semibold">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Confirm Password</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white">
              <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {errors.confirmPassword && <span className="text-[10px] text-brand-accent-dest font-semibold">{errors.confirmPassword}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2.5 px-4 text-sm shadow hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-brand-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-secondary hover:underline">
              Login here.
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
