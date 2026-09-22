/**
 * Home Page Content
 * 
 * Non-technical team members can freely edit the headline, subtitle,
 * feature bullet points, and CTA descriptions here.
 */

export const homeContent = {
  hero: {
    badge: 'Smart Indoor Wayfinding',
    titleLine1: 'Find Your Way',
    titleLine2: 'Inside.',
    subtitle: 'Navigate classrooms, laboratories, offices, departments, and campus facilities with simple, clear indoor directions.',
    ctaPrimary: 'Start Navigation',
    ctaSecondary: 'Explore Buildings',
    searchPlaceholder: 'Where do you want to go?'
  },
  popularDestinations: {
    title: 'Popular Destinations',
    subtitle: 'Frequently visited lecture halls, labs, and essential facilities.',
    viewAllButton: 'View All Locations'
  },
  campusBuildings: {
    title: 'Campus Academic Blocks',
    subtitle: 'Explore campus facilities and floor plan blueprints across institutional blocks.',
    viewBuildingsButton: 'View All Buildings',
    viewDetailsButton: 'View Building Details'
  },
  features: {
    title: 'Designed for Seamless Mobility',
    subtitle: 'No more getting lost in corridors. Discover our multi-floor pathway routing, custom directory listings, and accessibility options.',
    items: [
      {
        icon: 'Compass',
        title: 'Interactive Map Grid',
        description: 'Zoom and pan SVG layouts of campus blocks. Click room spaces to view department, hours, and navigation waypoints.'
      },
      {
        icon: 'Layers',
        title: 'Multi-Floor Wayfinding',
        description: 'Get seamless direction steps when your source and target locations span different floor levels, using staircases or elevators.'
      },
      {
        icon: 'Accessibility',
        title: 'Accessibility Options',
        description: 'Filter pathways to only include elevators, ramps, and accessible toilets, ensuring easy navigation for everyone.'
      }
    ]
  }
};

export default homeContent;
