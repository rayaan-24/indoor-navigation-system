import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormTouched {
  fullName?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

export const validateFullName = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Full name is required.';
  }
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return 'Name can only contain letters and spaces.';
  }
  return '';
};

export const validateEmail = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return '';
};

export const validatePassword = (value: string): string => {
  if (!value) {
    return 'Password is required.';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;~`']|[^A-Za-z0-9\s]/.test(value)) {
    return 'Password must contain at least one special character.';
  }
  return '';
};

export const validateConfirmPassword = (confirmVal: string, passwordVal: string): string => {
  if (!confirmVal) {
    return 'Please confirm your password.';
  }
  if (confirmVal !== passwordVal) {
    return 'Passwords do not match.';
  }
  return '';
};

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let err = '';
    if (field === 'fullName') err = validateFullName(fullName);
    else if (field === 'email') err = validateEmail(email);
    else if (field === 'password') err = validatePassword(password);
    else if (field === 'confirmPassword') err = validateConfirmPassword(confirmPassword, password);

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    if (touched.fullName) {
      setErrors((prev) => ({
        ...prev,
        fullName: validateFullName(value)
      }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value)
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value)
      }));
    }
    // If confirm password has been touched or has a value, revalidate to clear or update mismatch
    if (touched.confirmPassword || confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, value)
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, password)
      }));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched upon submission attempt
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    const currentErrors: FormErrors = {
      fullName: nameErr,
      email: emailErr,
      password: passErr,
      confirmPassword: confirmErr
    };

    setErrors(currentErrors);

    // Prevent submission if any validation fails
    if (nameErr || emailErr || passErr || confirmErr) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await register(fullName.trim(), email.trim(), password, confirmPassword);
      if (res.success) {
        navigate('/profile');
      }
    } catch (err: any) {
      console.error('Registration submit error:', err);
      const errMsg = err.response?.data?.message || 'Failed to register account. Please try again.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldBorderClass = (field: keyof FormErrors) => {
    const isInvalid = !!(touched[field] && errors[field]);
    return isInvalid
      ? 'border-brand-accent-dest focus-within:border-brand-accent-dest bg-red-50/20'
      : 'border-slate-300 focus-within:border-brand-secondary bg-slate-50 focus-within:bg-white';
  };

  const getIconClass = (field: keyof FormErrors) => {
    const isInvalid = !!(touched[field] && errors[field]);
    return isInvalid ? 'text-brand-accent-dest' : 'text-slate-400';
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-md space-y-6">
        
        {/* Header Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-primary">Create an Account</h2>
          <p className="text-brand-muted text-xs mt-2">Sign up to sync favorites and route maps across campus devices.</p>
        </div>

        {/* Registration Precautions & Requirements Card */}
        <div className="p-3.5 bg-blue-50/90 border border-blue-100 rounded-xl text-[11px] text-brand-primary space-y-2">
          <p className="font-bold flex items-center text-brand-secondary">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-brand-secondary flex-shrink-0" />
            Registration Guidelines & Security Precautions:
          </p>
          <ul className="space-y-1 text-slate-600 pl-4 list-disc marker:text-brand-secondary text-[11px] leading-relaxed">
            <li>
              <strong>Mandatory Authentication:</strong> User authentication is required to bookmark favorite campus locations and maintain your personal route history.
            </li>
            <li>
              <strong>Institutional Email:</strong> Please use a valid campus or academic email address (<span className="text-brand-secondary font-mono text-[10px]">@campus.edu</span>).
            </li>
            <li>
              <strong>Password Criteria:</strong> Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.
            </li>
            <li>
              <strong>Account Protection:</strong> Passwords are encrypted with salted hashes. Keep your login credentials private; never share passwords with others.
            </li>
          </ul>
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-100 text-brand-accent-dest rounded-lg text-xs font-semibold text-center animate-fade-in">
            {submitError}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Full Name
            </label>
            <div className={`relative flex items-center border rounded-lg px-3 py-2 transition-colors ${getFieldBorderClass('fullName')}`}>
              <User className={`w-4 h-4 mr-2 flex-shrink-0 transition-colors ${getIconClass('fullName')}`} />
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={handleFullNameChange}
                onBlur={() => handleBlur('fullName')}
                aria-invalid={!!(touched.fullName && errors.fullName)}
                aria-describedby={touched.fullName && errors.fullName ? 'fullName-error' : undefined}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {touched.fullName && errors.fullName && (
              <span id="fullName-error" role="alert" className="text-[10px] text-brand-accent-dest font-semibold block">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Email Address
            </label>
            <div className={`relative flex items-center border rounded-lg px-3 py-2 transition-colors ${getFieldBorderClass('email')}`}>
              <Mail className={`w-4 h-4 mr-2 flex-shrink-0 transition-colors ${getIconClass('email')}`} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@campus.edu"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                aria-invalid={!!(touched.email && errors.email)}
                aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {touched.email && errors.email && (
              <span id="email-error" role="alert" className="text-[10px] text-brand-accent-dest font-semibold block">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Password
            </label>
            <div className={`relative flex items-center border rounded-lg px-3 py-2 transition-colors ${getFieldBorderClass('password')}`}>
              <Lock className={`w-4 h-4 mr-2 flex-shrink-0 transition-colors ${getIconClass('password')}`} />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                aria-invalid={!!(touched.password && errors.password)}
                aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {touched.password && errors.password && (
              <span id="password-error" role="alert" className="text-[10px] text-brand-accent-dest font-semibold block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Confirm Password
            </label>
            <div className={`relative flex items-center border rounded-lg px-3 py-2 transition-colors ${getFieldBorderClass('confirmPassword')}`}>
              <Lock className={`w-4 h-4 mr-2 flex-shrink-0 transition-colors ${getIconClass('confirmPassword')}`} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => handleBlur('confirmPassword')}
                aria-invalid={!!(touched.confirmPassword && errors.confirmPassword)}
                aria-describedby={touched.confirmPassword && errors.confirmPassword ? 'confirmPassword-error' : undefined}
                className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <span id="confirmPassword-error" role="alert" className="text-[10px] text-brand-accent-dest font-semibold block">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-3 px-4 text-sm shadow hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="text-center pt-2 text-xs">
          <span className="text-brand-muted">Already registered? </span>
          <Link to="/login" className="font-bold text-brand-secondary hover:underline">Sign In</Link>
        </div>

      </div>
    </div>
  );
}
