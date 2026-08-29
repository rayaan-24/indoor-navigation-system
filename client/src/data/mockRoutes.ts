import type { Route } from '../types';

export const mockRoutes: Route[] = [
  {
    id: 'b-entrance-to-b-comp-lab-204',
    fromLocationId: 'b-entrance',
    toLocationId: 'b-comp-lab-204',
    distance: 180,
    duration: 3,
    steps: [
      { instruction: 'Enter Block B through the Main Entrance lobby.', type: 'straight' },
      { instruction: 'Walk straight past the reception desk for 15 meters.', type: 'straight' },
      { instruction: 'Turn left at the junction toward the central elevator lobby.', type: 'turn-left' },
      { instruction: 'Take Elevator B2 or Staircase B1 up to the 2nd Floor.', type: 'up-stairs', floor: 2 },
      { instruction: 'Exit the elevator, turn right, and enter the main corridor.', type: 'turn-right' },
      { instruction: 'Walk 30 meters down the corridor, passing Room B202 on your right.', type: 'straight' },
      { instruction: 'Computer Laboratory B204 is straight ahead on your left.', type: 'destination' }
    ],
    pathPoints: {
      0: [
        { x: 500, y: 850 }, // Entrance
        { x: 500, y: 700 }, // Lobby center
        { x: 450, y: 700 }, // Corrdior junction
        { x: 450, y: 550 }  // Elevator B2
      ],
      1: [
        { x: 450, y: 550 }  // Elevator 1st Floor pass-through
      ],
      2: [
        { x: 450, y: 550 }, // Elevator B2 2nd Floor
        { x: 450, y: 480 }, // Exit lobby
        { x: 500, y: 480 }, // Main corridor junction
        { x: 500, y: 300 }  // Room B204
      ]
    }
  },
  {
    id: 'b-cafeteria-to-b-cs-office',
    fromLocationId: 'b-cafeteria',
    toLocationId: 'b-cs-office',
    distance: 95,
    duration: 2,
    steps: [
      { instruction: 'Exit the Cafeteria and head west toward the staircase.', type: 'straight' },
      { instruction: 'Turn right and use Staircase B1 to go up to the 1st Floor.', type: 'up-stairs', floor: 1 },
      { instruction: 'Exit the staircase and turn left into the academic corridor.', type: 'turn-left' },
      { instruction: 'Walk 10 meters. The Computer Science Department Office will be on your left.', type: 'destination' }
    ],
    pathPoints: {
      0: [
        { x: 800, y: 300 }, // Cafeteria
        { x: 850, y: 300 },
        { x: 850, y: 550 },
        { x: 900, y: 550 }  // Staircase Ground
      ],
      1: [
        { x: 900, y: 550 }, // Staircase 1st floor
        { x: 850, y: 550 },
        { x: 850, y: 300 },
        { x: 800, y: 300 }  // CS Office
      ]
    }
  },
  {
    id: 'b-entrance-to-b-seminar-hall',
    fromLocationId: 'b-entrance',
    toLocationId: 'b-seminar-hall',
    distance: 45,
    duration: 1,
    steps: [
      { instruction: 'Enter Block B and walk straight for 10 meters.', type: 'straight' },
      { instruction: 'Turn left at the first corridor junction.', type: 'turn-left' },
      { instruction: 'Walk straight past the restroom. The Seminar Hall is on your right.', type: 'destination' }
    ],
    pathPoints: {
      0: [
        { x: 500, y: 850 }, // Entrance
        { x: 500, y: 700 }, // Lobby center
        { x: 250, y: 700 }, // Left corridor
        { x: 250, y: 550 },
        { x: 200, y: 300 }  // Seminar Hall
      ]
    }
  }
];
