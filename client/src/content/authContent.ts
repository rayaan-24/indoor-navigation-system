/**
 * Authentication Pages Content (Login & Register)
 * 
 * Edit login titles, precaution details, demo credentials copy,
 * and registration instructions here.
 */

export const authContent = {
  login: {
    title: 'Sign in to IndoorNav',
    subtitle: 'Access your favorite locations and route history.',
    mandatoryAuth: {
      title: 'Authentication Mandatory:',
      description: 'Verified authentication is required to bookmark campus favorites, record your private route history, and access saved navigation preferences.'
    },
    demoAccounts: {
      title: 'Verifiable Campus Accounts:',
      admin: {
        label: 'Admin Console',
        email: 'admin@indoornav.com',
        password: 'IndoorNav@123'
      },
      student: {
        label: 'Student Profile',
        email: 'student@campus.edu',
        password: 'IndoorNav@123'
      }
    },
    fields: {
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@campus.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      forgotPasswordText: 'Forgot?'
    },
    submitButton: 'Sign In',
    submittingText: 'Signing in...',
    switchPrompt: 'New to campus?',
    switchLinkText: 'Create an Account'
  },
  register: {
    title: 'Create an Account',
    subtitle: 'Sign up to sync favorites and route maps across campus devices.',
    precautions: {
      title: 'Registration Guidelines & Security Precautions:',
      items: [
        {
          label: 'Mandatory Authentication',
          text: 'User authentication is required to bookmark favorite campus locations and maintain your personal route history.'
        },
        {
          label: 'Institutional Email',
          text: 'Please use a valid campus or academic email address (@campus.edu).'
        },
        {
          label: 'Password Criteria',
          text: 'Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.'
        },
        {
          label: 'Account Protection',
          text: 'Passwords are encrypted with salted hashes. Keep your login credentials private; never share passwords with others.'
        }
      ]
    },
    fields: {
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Jane Doe',
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@campus.edu',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Minimum 8 characters',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter password'
    },
    passwordRules: {
      title: 'Password Requirements:',
      rules: [
        'At least 8 characters long',
        'At least 1 uppercase letter (A-Z)',
        'At least 1 lowercase letter (a-z)',
        'At least 1 numeric digit (0-9)',
        'At least 1 special character (!@#$%^&*)'
      ]
    },
    submitButton: 'Register Account',
    submittingText: 'Registering...',
    switchPrompt: 'Already registered?',
    switchLinkText: 'Sign In'
  }
};

export default authContent;
