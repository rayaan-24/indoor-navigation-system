import type { Location } from '../types';

export const mockLocations: Location[] = [
  // BLOCK B (Computer Science Block)
  // Ground Floor (Floor 0)
  {
    id: 'b-entrance',
    name: 'Main Entrance (Block B)',
    category: 'Exit',
    buildingId: 'block-b',
    floor: 0,
    description: 'Main entryway to the Computer Science Block, leading from the central campus courtyard.',
    coordinates: { x: 500, y: 850 },
    nearbyLocations: ['b-elevator', 'b-restroom-0'],
    openingHours: '24/7'
  },
  {
    id: 'b-seminar-hall',
    name: 'Block B Seminar Hall',
    category: 'Facility',
    buildingId: 'block-b',
    floor: 0,
    description: 'A 150-seat hall equipped with digital projection systems, used for guest lectures and department seminars.',
    capacity: '150 seats',
    department: 'Computer Science',
    coordinates: { x: 200, y: 300 },
    nearbyLocations: ['b-staircase-1', 'b-restroom-0'],
    openingHours: '08:00 AM - 06:00 PM'
  },
  {
    id: 'b-cafeteria',
    name: 'Student Cafeteria (Block B)',
    category: 'Cafeteria',
    buildingId: 'block-b',
    floor: 0,
    description: 'Grab snacks, coffee, and lunch. Offers outdoor seating and high-speed Wi-Fi.',
    capacity: '80 seats',
    coordinates: { x: 800, y: 300 },
    nearbyLocations: ['b-elevator', 'b-staircase-1'],
    openingHours: '07:30 AM - 08:30 PM'
  },
  {
    id: 'b-elevator-0',
    name: 'Elevator B2 (Ground Floor)',
    category: 'Elevator',
    buildingId: 'block-b',
    floor: 0,
    description: 'Multi-floor central passenger elevator servicing floors Ground, 1st, and 2nd.',
    coordinates: { x: 450, y: 550 },
    nearbyLocations: ['b-entrance', 'b-restroom-0'],
    openingHours: '24/7'
  },
  {
    id: 'b-staircase-0',
    name: 'Staircase B1 (Ground Floor)',
    category: 'Staircase',
    buildingId: 'block-b',
    floor: 0,
    description: 'Main access staircase leading to higher floors of Block B.',
    coordinates: { x: 900, y: 550 },
    nearbyLocations: ['b-cafeteria'],
    openingHours: '24/7'
  },
  {
    id: 'b-restroom-0',
    name: 'Restroom (Ground Floor Block B)',
    category: 'Restroom',
    buildingId: 'block-b',
    floor: 0,
    description: 'Male, Female, and Accessible restrooms.',
    coordinates: { x: 100, y: 550 },
    nearbyLocations: ['b-seminar-hall', 'b-elevator-0'],
    openingHours: '24/7'
  },

  // 1st Floor (Floor 1)
  {
    id: 'b-programming-lab',
    name: 'Programming Laboratory B101',
    category: 'Laboratory',
    buildingId: 'block-b',
    floor: 1,
    description: 'Equipped with 60 high-performance computer terminals running Linux/Windows, configured for coding courses and compiler labs.',
    capacity: '60 students',
    department: 'Computer Science',
    coordinates: { x: 200, y: 300 },
    nearbyLocations: ['b-elevator-1', 'b-restroom-1'],
    openingHours: '08:00 AM - 08:00 PM'
  },
  {
    id: 'b-cs-office',
    name: 'Computer Science Department Office',
    category: 'Department',
    buildingId: 'block-b',
    floor: 1,
    description: 'Administration office for the Computer Science & Engineering department. Submit project proposals and academic requests here.',
    department: 'Computer Science',
    coordinates: { x: 800, y: 300 },
    nearbyLocations: ['b-staircase-1', 'b-elevator-1'],
    openingHours: '09:00 AM - 05:00 PM'
  },
  {
    id: 'b-elevator-1',
    name: 'Elevator B2 (1st Floor)',
    category: 'Elevator',
    buildingId: 'block-b',
    floor: 1,
    description: 'Multi-floor central passenger elevator servicing floors Ground, 1st, and 2nd.',
    coordinates: { x: 450, y: 550 },
    nearbyLocations: ['b-programming-lab', 'b-cs-office'],
    openingHours: '24/7'
  },
  {
    id: 'b-staircase-1',
    name: 'Staircase B1 (1st Floor)',
    category: 'Staircase',
    buildingId: 'block-b',
    floor: 1,
    description: 'Main access staircase leading to ground and upper floors of Block B.',
    coordinates: { x: 900, y: 550 },
    nearbyLocations: ['b-cs-office'],
    openingHours: '24/7'
  },
  {
    id: 'b-restroom-1',
    name: 'Restroom (1st Floor Block B)',
    category: 'Restroom',
    buildingId: 'block-b',
    floor: 1,
    description: 'Male, Female, and Accessible restrooms.',
    coordinates: { x: 100, y: 550 },
    nearbyLocations: ['b-programming-lab'],
    openingHours: '24/7'
  },

  // 2nd Floor (Floor 2)
  {
    id: 'b-comp-lab-204',
    name: 'Computer Laboratory B204',
    category: 'Laboratory',
    buildingId: 'block-b',
    floor: 2,
    description: 'Advanced Lab configured for AI, Machine Learning, and Cloud Computing research. Features dual-monitor setups and GPU access.',
    capacity: '45 students',
    department: 'Computer Science',
    coordinates: { x: 500, y: 300 },
    nearbyLocations: ['b-elevator-2', 'b-staircase-2', 'b-restroom-2'],
    openingHours: '08:00 AM - 09:00 PM'
  },
  {
    id: 'b-hod-cs',
    name: 'HOD Computer Science Room B201',
    category: 'Office',
    buildingId: 'block-b',
    floor: 2,
    description: 'Office of the Head of the Computer Science Department. Contact here for academic approvals and consultations.',
    department: 'Computer Science',
    coordinates: { x: 200, y: 300 },
    nearbyLocations: ['b-restroom-2'],
    openingHours: '10:00 AM - 04:00 PM'
  },
  {
    id: 'b-research-lab',
    name: 'IoT & Robotics Research Lab B202',
    category: 'Laboratory',
    buildingId: 'block-b',
    floor: 2,
    description: 'Research zone for embedded systems, Internet of Things (IoT), and robotic assembly. Restricted access for researchers.',
    capacity: '20 researchers',
    department: 'Computer Science & Electronics',
    coordinates: { x: 800, y: 300 },
    nearbyLocations: ['b-staircase-2'],
    openingHours: '09:00 AM - 07:00 PM'
  },
  {
    id: 'b-elevator-2',
    name: 'Elevator B2 (2nd Floor)',
    category: 'Elevator',
    buildingId: 'block-b',
    floor: 2,
    description: 'Multi-floor central passenger elevator servicing floors Ground, 1st, and 2nd.',
    coordinates: { x: 450, y: 550 },
    nearbyLocations: ['b-comp-lab-204', 'b-research-lab'],
    openingHours: '24/7'
  },
  {
    id: 'b-staircase-2',
    name: 'Staircase B1 (2nd Floor)',
    category: 'Staircase',
    buildingId: 'block-b',
    floor: 2,
    description: 'Main access staircase leading to lower floors of Block B.',
    coordinates: { x: 900, y: 550 },
    nearbyLocations: ['b-research-lab', 'b-comp-lab-204'],
    openingHours: '24/7'
  },
  {
    id: 'b-restroom-2',
    name: 'Restroom (2nd Floor Block B)',
    category: 'Restroom',
    buildingId: 'block-b',
    floor: 2,
    description: 'Male, Female, and Accessible restrooms.',
    coordinates: { x: 100, y: 550 },
    nearbyLocations: ['b-hod-cs', 'b-comp-lab-204'],
    openingHours: '24/7'
  },

  // BLOCK A (Academic Block)
  // Ground Floor
  {
    id: 'a-entrance',
    name: 'Main Entrance (Block A)',
    category: 'Exit',
    buildingId: 'block-a',
    floor: 0,
    description: 'Main campus portal to Block A, directly opposite the university library lawn.',
    coordinates: { x: 500, y: 850 },
    nearbyLocations: ['a-auditorium'],
    openingHours: '24/7'
  },
  {
    id: 'a-auditorium',
    name: 'Main Auditorium (Block A)',
    category: 'Facility',
    buildingId: 'block-a',
    floor: 0,
    description: 'A grand auditorium with seating for 800. Host for official campus orientations, cultural fests, and annual convocations.',
    capacity: '800 seats',
    coordinates: { x: 500, y: 300 },
    nearbyLocations: ['a-entrance'],
    openingHours: '08:00 AM - 10:00 PM'
  },
  {
    id: 'a-central-library',
    name: 'Central Library (Block A)',
    category: 'Library',
    buildingId: 'block-a',
    floor: 1,
    description: 'Spread across the entire 1st floor of Block A. Houses over 50,000 academic texts, reference guides, digital archives, and quiet study booths.',
    capacity: '300 students',
    coordinates: { x: 500, y: 400 },
    nearbyLocations: ['a-staircase-1'],
    openingHours: '08:00 AM - 10:00 PM'
  },
  {
    id: 'a-staircase-1',
    name: 'Staircase A1 (1st Floor)',
    category: 'Staircase',
    buildingId: 'block-a',
    floor: 1,
    description: 'Primary staircase of Block A connecting Ground, 1st, 2nd, and 3rd floors.',
    coordinates: { x: 900, y: 550 },
    nearbyLocations: ['a-central-library'],
    openingHours: '24/7'
  },
  {
    id: 'a-seminar-202',
    name: 'Physics Lecture Hall A202',
    category: 'Classroom',
    buildingId: 'block-a',
    floor: 2,
    description: 'Tiered gallery classroom for undergraduate science courses. Fitted with sound amplification and smartboards.',
    capacity: '90 seats',
    department: 'Applied Sciences',
    coordinates: { x: 300, y: 300 },
    nearbyLocations: ['a-staircase-2'],
    openingHours: '08:30 AM - 05:30 PM'
  },
  {
    id: 'a-staircase-2',
    name: 'Staircase A1 (2nd Floor)',
    category: 'Staircase',
    buildingId: 'block-a',
    floor: 2,
    description: 'Primary staircase of Block A.',
    coordinates: { x: 900, y: 550 },
    nearbyLocations: ['a-seminar-202'],
    openingHours: '24/7'
  },

  // BLOCK C (Administration Block)
  {
    id: 'c-admin-office',
    name: 'Central Administration Office',
    category: 'Office',
    buildingId: 'block-c',
    floor: 0,
    description: 'Central registrar and reception area. Visit for ID card replacement, transcripts, course registrations, and guest queries.',
    coordinates: { x: 500, y: 350 },
    nearbyLocations: ['c-entrance'],
    openingHours: '09:00 AM - 05:00 PM'
  },
  {
    id: 'c-entrance',
    name: 'Admin Main Entrance',
    category: 'Exit',
    buildingId: 'block-c',
    floor: 0,
    description: 'Entryway to Block C from the main administrative driveway.',
    coordinates: { x: 500, y: 850 },
    nearbyLocations: ['c-admin-office'],
    openingHours: '08:00 AM - 08:00 PM'
  }
];
