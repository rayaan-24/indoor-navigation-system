/**
 * Global Site Configuration
 * 
 * Non-technical team members can easily edit the website title,
 * branding, contact details, and demo accounts here without touching code.
 */

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  demoAccounts: {
    admin: {
      email: string;
      role: string;
      label: string;
    };
    student: {
      email: string;
      role: string;
      label: string;
    };
    defaultPassword: string;
  };
  copyrightYear: number;
}

export const siteConfig: SiteConfig = {
  name: 'IndoorNav',
  shortName: 'IN',
  tagline: 'Find Your Way Inside.',
  description: 'Smart indoor navigation for modern campuses and complex architectural buildings. Find classrooms, laboratories, and facilities with ease.',
  contact: {
    email: 'support@indoornav.com',
    phone: '+91 8838545775',
    address: 'SJT Academic Block, Campus Main Road'
  },
  demoAccounts: {
    admin: {
      email: 'admin@indoornav.com',
      role: 'Administrator',
      label: 'Admin Console'
    },
    student: {
      email: 'student@campus.edu',
      role: 'Student',
      label: 'Student Profile'
    },
    defaultPassword: 'IndoorNav@123'
  },
  copyrightYear: new Date().getFullYear()
};

export default siteConfig;
