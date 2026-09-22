/**
 * About Page Content
 * 
 * Edit the mission, problem statement, solution details, roadmap steps,
 * and tech stack description here.
 */

export const aboutContent = {
  hero: {
    titleLine1: 'Making Indoor Navigation',
    titleLine2: 'Simpler.',
    subtitle: 'IndoorNav is built specifically to address the modern challenges of navigating complex layouts, large campus blocks, and university corridors.'
  },
  problem: {
    title: 'The Problem',
    description: 'Large university campuses, academic blocks, corporate headquarters, and medical centers can be extremely disorienting. Students, visiting guests, faculty, and administrative staff lose valuable time trying to locate specific classrooms, laboratories, department office rooms, and restrooms. Standard physical directories are static, non-interactive, and often outdated.'
  },
  solution: {
    title: 'Our Solution',
    description: 'IndoorNav provides an accessible, mobile-first web interface that acts as an interactive digital directory. Users can search for rooms, filter by block/floor categories, view vector-based schematic floor plan layouts, and receive step-by-step navigation instructions crossing staircases and elevator systems. It resolves indoor navigation hurdles instantly.'
  },
  roadmap: {
    title: 'How We Solve Wayfinding',
    steps: [
      {
        step: '01',
        title: 'Search Rooms',
        description: 'Instantly find classrooms, labs, HOD offices, or restrooms with autocomplete filters.'
      },
      {
        step: '02',
        title: 'Select Start/End',
        description: 'Choose your current entrance/room point and click the target room location.'
      },
      {
        step: '03',
        title: 'Generate Route',
        description: 'System calculates path lines traversing hallways, elevator systems, or stairs.'
      },
      {
        step: '04',
        title: 'Turn-By-Turn Steps',
        description: 'Follow clear instructions with total distance and estimated walking time.'
      }
    ]
  },
  techStack: {
    title: 'Modern Architecture & Technologies',
    items: [
      {
        name: 'React.js',
        role: 'Frontend & UI Shell',
        desc: 'Handles client-side views, path overlays, layout responsiveness, and application state routing.'
      },
      {
        name: 'Vite & TS',
        role: 'Build & Type-Safety',
        desc: 'Ensures lightning-fast compilation, modern module loading, and rigorous client code typing.'
      },
      {
        name: 'Tailwind CSS',
        role: 'Premium Style System',
        desc: 'Utility CSS framework enabling clean dark navy and blue layout systems without performance bloat.'
      },
      {
        name: 'Node.js & Express',
        role: 'Backend API Service',
        desc: 'Processes routing algorithms, database calls, and access authentication in future development phases.'
      },
      {
        name: 'MongoDB',
        role: 'Data Persistence',
        desc: 'Stores coordinate layouts, node paths, and user bookmarks in structured document format.'
      }
    ]
  }
};

export default aboutContent;
