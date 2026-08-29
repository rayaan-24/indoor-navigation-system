export type LocationCategory =
  | 'Classroom'
  | 'Laboratory'
  | 'Department'
  | 'Office'
  | 'Facility'
  | 'Library'
  | 'Cafeteria'
  | 'Restroom'
  | 'Elevator'
  | 'Staircase'
  | 'Exit'
  | 'Emergency';

export interface Location {
  id: string;
  name: string;
  category: LocationCategory;
  buildingId: string;
  floor: number; // 0 = Ground, 1 = 1st, 2 = 2nd, etc.
  description: string;
  capacity?: string;
  department?: string;
  coordinates: { x: number; y: number }; // Coordinates relative to the SVG map layout (0-1000)
  nearbyLocations?: string[]; // IDs of nearby locations
  openingHours?: string;
  facilities?: string[];
}

export interface Building {
  id: string;
  name: string;
  description: string;
  floors: number[]; // e.g. [0, 1, 2, 3]
  totalLocations: number;
  imageUrl?: string; // Standard illustration/schematic preview
}

export interface RouteStep {
  instruction: string;
  type: 'straight' | 'turn-left' | 'turn-right' | 'up-stairs' | 'down-stairs' | 'elevator' | 'destination';
  floor?: number;
}

export interface Route {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  distance: number; // in meters
  duration: number; // in minutes
  steps: RouteStep[];
  pathPoints: { [floor: number]: { x: number; y: number }[] }; // Map coordinates per floor for route overlay
}

export interface HistoryItem {
  id: string;
  fromLocation: { name: string; building: string; floor: string };
  toLocation: { name: string; building: string; floor: string };
  timestamp: string;
}

export interface FeedbackReport {
  id: string;
  type: 'Incorrect room' | 'Incorrect route' | 'Missing location' | 'Blocked path' | 'Incorrect building information' | 'Other';
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
}
