/**
 * Navigation Configuration
 * 
 * Edit menu items, header links, and footer link columns here.
 */

export interface NavLinkItem {
  label: string;
  path: string;
  iconName?: 'Compass' | 'MapPin' | 'Building2' | 'Search' | 'HelpCircle' | 'Info';
}

export interface NavGroup {
  title: string;
  links: {
    label: string;
    path: string;
    isExternal?: boolean;
  }[];
}

// Main header navigation tabs (shown when logged in)
export const headerNavLinks: NavLinkItem[] = [
  { label: 'Home', path: '/', iconName: 'Compass' },
  { label: 'Explore', path: '/explore', iconName: 'MapPin' },
  { label: 'Buildings', path: '/buildings', iconName: 'Building2' },
  { label: 'Locations', path: '/locations', iconName: 'Search' },
  { label: 'About', path: '/about', iconName: 'Info' },
  { label: 'Help', path: '/help', iconName: 'HelpCircle' },
];

// Footer navigation columns
export const footerNavGroups: NavGroup[] = [
  {
    title: 'Navigation',
    links: [
      { label: 'Home', path: '/' },
      { label: 'Explore Map', path: '/explore' },
      { label: 'Buildings', path: '/buildings' },
      { label: 'Locations Directory', path: '/locations' },
    ]
  },
  {
    title: 'Information',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Help & FAQ', path: '/help' },
      { label: 'Report an Issue', path: '/feedback' },
      { label: 'Submit Feedback', path: '/feedback' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', path: '#privacy' },
      { label: 'Terms of Service', path: '#terms' },
      { label: 'System Admin Access', path: '/admin' },
    ]
  }
];

// Reusable action button labels
export const actionLabels = {
  startNavigation: 'Start Navigation',
  exploreBuildings: 'Explore Buildings',
  login: 'Login',
  register: 'Register',
  logout: 'Logout',
  myProfile: 'My Profile',
  adminDashboard: 'Admin Dashboard',
  searchPlaceholder: 'Where do you want to go?'
};
