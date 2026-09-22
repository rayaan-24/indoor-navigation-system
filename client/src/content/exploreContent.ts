/**
 * Explore / Wayfinding Page Content
 * 
 * Edit wayfinding labels, instruction headers, and map controls here.
 */

export const exploreContent = {
  header: {
    title: 'Indoor Wayfinding & Navigation',
    subtitle: 'Select your starting location and destination to generate turn-by-turn indoor walking directions.'
  },
  planner: {
    title: 'Route Planner',
    startLabel: 'Starting Location',
    startPlaceholder: 'Choose where you are...',
    destinationLabel: 'Destination',
    destinationPlaceholder: 'Choose where you want to go...',
    calculateButton: 'Calculate Route',
    calculatingText: 'Calculating...',
    clearButton: 'Clear',
    swapButton: 'Swap Locations',
    selectOnMapPrompt: 'Click on any room or entrance on the floor plan map to set as destination.'
  },
  instructions: {
    title: 'Turn-by-Turn Directions',
    totalDistanceLabel: 'Total Distance',
    estimatedTimeLabel: 'Estimated Walk Time',
    noRoutePrompt: 'Select a start and destination point to generate route steps.'
  },
  mapControls: {
    floorSelectorLabel: 'Floor Level',
    groundFloorLabel: 'Ground Floor (Level 0)',
    firstFloorLabel: 'First Floor (Level 1)',
    secondFloorLabel: 'Second Floor (Level 2)',
    legend: {
      rooms: 'Classrooms & Labs',
      corridors: 'Hallways & Walkways',
      elevators: 'Lifts',
      stairs: 'Stairwells',
      exits: 'Building Exits'
    }
  }
};

export default exploreContent;
