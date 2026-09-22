/**
 * Locations Directory Content
 * 
 * Edit directory headings, search placeholders, filter tabs,
 * and expand/collapse button labels here.
 */

export const locationsContent = {
  header: {
    title: 'Locations Directory',
    subtitle: 'Browse classrooms, laboratories, faculty cabins, and facilities across campus blocks.'
  },
  search: {
    placeholder: 'Search room name, code (e.g. G01), or department...'
  },
  categories: [
    { label: 'All Locations', value: 'all' },
    { label: 'Classrooms', value: 'Classroom' },
    { label: 'Laboratories', value: 'Laboratory' },
    { label: 'Offices & Cabins', value: 'Office' },
    { label: 'Cafeteria & Dining', value: 'Cafeteria' },
    { label: 'Restrooms', value: 'Restroom' },
    { label: 'Facilities', value: 'Facility' }
  ],
  expandControls: {
    initialLimit: 6,
    expandButtonText: (total: number) => `Expand to View All (${total} Classrooms & Locations)`,
    collapseButtonText: (count: number) => `Show Less (Collapse to ${count} Classrooms)`,
    summaryText: (showing: number, total: number, remaining: number) =>
      `Showing ${showing} of ${total} locations (${remaining} more available)`
  },
  emptyState: {
    title: 'No locations found',
    description: "We couldn't find any rooms matching your search queries. Try adjusting your building, floor, or category filters.",
    resetButtonText: 'Clear all filters'
  },
  buttons: {
    viewDetails: 'View Details',
    getDirections: 'Directions',
    navigateHere: 'Navigate Here'
  }
};

export default locationsContent;
