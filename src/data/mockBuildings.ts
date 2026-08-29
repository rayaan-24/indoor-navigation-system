import type { Building } from '../types';

export const mockBuildings: Building[] = [
  {
    id: 'block-a',
    name: 'Block A',
    description: 'Academic Block containing classrooms, seminar halls, lecture theatres, and departments for basic sciences.',
    floors: [0, 1, 2, 3],
    totalLocations: 85,
  },
  {
    id: 'block-b',
    name: 'Block B',
    description: 'Computer Science and Information Technology Block. Equipped with advanced computing laboratories, research centers, and faculty rooms.',
    floors: [0, 1, 2],
    totalLocations: 62,
  },
  {
    id: 'block-c',
    name: 'Block C',
    description: 'Administration Block housing the main offices, admission cell, finance office, conference rooms, and director office.',
    floors: [0, 1],
    totalLocations: 35,
  },
];
