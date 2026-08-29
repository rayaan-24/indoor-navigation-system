const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Models
const User = require('../models/User');
const Building = require('../models/Building');
const Floor = require('../models/Floor');
const Room = require('../models/Room');
const Landmark = require('../models/Landmark');
const Route = require('../models/Route');
const Feedback = require('../models/Feedback');

const seedDatabase = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/indoornav';
    await mongoose.connect(connString);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing database
    await User.deleteMany({});
    await Building.deleteMany({});
    await Floor.deleteMany({});
    await Room.deleteMany({});
    await Landmark.deleteMany({});
    await Route.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing collections.');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedStudentPassword = await bcrypt.hash('123456', salt);
    const hashedAdminPassword = await bcrypt.hash('123456', salt);

    const users = await User.insertMany([
      {
        name: 'Jane Doe',
        email: 'student@campus.edu',
        password: hashedStudentPassword,
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@indoornav.com',
        password: hashedAdminPassword,
        role: 'admin'
      }
    ]);
    console.log(`Seeded ${users.length} user accounts.`);

    // 3. Seed Buildings
    const buildingsData = [
      {
        name: 'Block A',
        code: 'block-a',
        description: 'Academic Block containing classrooms, seminar halls, lecture theatres, and departments for basic sciences.',
        numberOfFloors: 4,
        numberOfLocations: 85,
        facilities: ['Smartboards', 'A/C Lecture Halls', 'Wi-Fi Lounge'],
        isActive: true
      },
      {
        name: 'Block B',
        code: 'block-b',
        description: 'Computer Science and Information Technology Block. Equipped with advanced computing laboratories, research centers, and faculty rooms.',
        numberOfFloors: 3,
        numberOfLocations: 62,
        facilities: ['GPU Computing Clusters', 'Robotics Lab', 'Cafeteria', 'Elevator'],
        isActive: true
      },
      {
        name: 'Block C',
        code: 'block-c',
        description: 'Administration Block housing the main offices, admission cell, finance office, conference rooms, and director office.',
        numberOfFloors: 2,
        numberOfLocations: 35,
        facilities: ['Admission Desk', 'Registrar Office', 'Visitor Lounge'],
        isActive: true
      }
    ];

    const buildings = await Building.insertMany(buildingsData);
    console.log(`Seeded ${buildings.length} building blocks.`);

    const buildingMap = {};
    buildings.forEach(b => {
      buildingMap[b.code] = b._id;
    });

    // 4. Seed Floors
    const floorsData = [
      // Block A
      { buildingId: buildingMap['block-a'], name: 'Ground Floor', floorNumber: 0, floorCode: 'a-0', description: 'Auditorium, Lecture halls', isActive: true },
      { buildingId: buildingMap['block-a'], name: '1st Floor', floorNumber: 1, floorCode: 'a-1', description: 'Central Library, Classrooms', isActive: true },
      { buildingId: buildingMap['block-a'], name: '2nd Floor', floorNumber: 2, floorCode: 'a-2', description: 'Science Laboratories', isActive: true },
      { buildingId: buildingMap['block-a'], name: '3rd Floor', floorNumber: 3, floorCode: 'a-3', description: 'Research Offices', isActive: true },
      // Block B
      { buildingId: buildingMap['block-b'], name: 'Ground Floor', floorNumber: 0, floorCode: 'b-0', description: 'Seminar hall, cafeteria, main entry', isActive: true },
      { buildingId: buildingMap['block-b'], name: '1st Floor', floorNumber: 1, floorCode: 'b-1', description: 'Programming labs, faculty offices', isActive: true },
      { buildingId: buildingMap['block-b'], name: '2nd Floor', floorNumber: 2, floorCode: 'b-2', description: 'AI Labs, Head of Department office', isActive: true },
      // Block C
      { buildingId: buildingMap['block-c'], name: 'Ground Floor', floorNumber: 0, floorCode: 'c-0', description: 'Registrar, Admission and reception', isActive: true },
      { buildingId: buildingMap['block-c'], name: '1st Floor', floorNumber: 1, floorCode: 'c-1', description: 'Conference rooms, finance cell', isActive: true }
    ];

    const floors = await Floor.insertMany(floorsData);
    console.log(`Seeded ${floors.length} building floor levels.`);

    const floorMap = {}; // mapping `buildingCode-floorNumber` -> floorId
    floors.forEach(f => {
      const bCode = buildings.find(b => b._id.toString() === f.buildingId.toString()).code;
      floorMap[`${bCode}-${f.floorNumber}`] = f._id;
    });

    // 5. Seed Rooms & Landmarks (from mockLocations)
    const locationsRaw = [
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
        nearbyLocations: ['b-elevator-0', 'b-restroom-0'],
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
        nearbyLocations: ['b-staircase-0', 'b-restroom-0'],
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
        nearbyLocations: ['b-elevator-0', 'b-staircase-0'],
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

    const seededRooms = [];
    const seededLandmarks = [];

    const infrastructureCategories = ['Staircase', 'Elevator', 'Restroom', 'Exit'];

    for (const loc of locationsRaw) {
      const bId = buildingMap[loc.buildingId];
      const flId = floorMap[`${loc.buildingId}-${loc.floor}`];

      if (!bId || !flId) {
        console.warn(`Skipping seeding for location ${loc.id} due to missing building or floor mapping.`);
        continue;
      }

      const isLandmark = infrastructureCategories.includes(loc.category);

      const baseData = {
        buildingId: bId,
        floorId: flId,
        name: loc.name,
        description: loc.description,
        coordinates: loc.coordinates,
        isAccessible: true,
        isActive: true
      };

      if (isLandmark) {
        const landmarkDoc = await Landmark.create({
          ...baseData,
          type: loc.category
        });
        seededLandmarks.push(landmarkDoc);
      } else {
        const roomDoc = await Room.create({
          ...baseData,
          roomNumber: loc.id,
          roomType: loc.category,
          department: loc.department,
          capacity: loc.capacity,
          facilities: loc.capacity ? ['A/C', 'Projector'] : []
        });
        seededRooms.push(roomDoc);
      }
    }

    console.log(`Seeded ${seededRooms.length} Rooms and ${seededLandmarks.length} Infrastructure Landmarks.`);

    // 6. Seed Pre-calculated Routes (from mockRoutes)
    const routesRaw = [
      {
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
            { x: 500, y: 850 },
            { x: 500, y: 700 },
            { x: 450, y: 700 },
            { x: 450, y: 550 }
          ],
          1: [
            { x: 450, y: 550 }
          ],
          2: [
            { x: 450, y: 550 },
            { x: 450, y: 480 },
            { x: 500, y: 480 },
            { x: 500, y: 300 }
          ]
        }
      },
      {
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
            { x: 800, y: 300 },
            { x: 850, y: 300 },
            { x: 850, y: 550 },
            { x: 900, y: 550 }
          ],
          1: [
            { x: 900, y: 550 },
            { x: 850, y: 550 },
            { x: 850, y: 300 },
            { x: 800, y: 300 }
          ]
        }
      },
      {
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
            { x: 500, y: 850 },
            { x: 500, y: 700 },
            { x: 250, y: 700 },
            { x: 250, y: 550 },
            { x: 200, y: 300 }
          ]
        }
      }
    ];

    const seededRoutes = [];
    for (const r of routesRaw) {
      const routeDoc = await Route.create({
        buildingId: buildingMap['block-b'],
        fromLocationId: r.fromLocationId,
        toLocationId: r.toLocationId,
        distance: r.distance,
        duration: r.duration,
        steps: r.steps,
        pathPoints: r.pathPoints,
        isAccessible: true,
        isActive: true
      });
      seededRoutes.push(routeDoc);
    }
    console.log(`Seeded ${seededRoutes.length} route definitions.`);

    // 7. Seed Feedback
    const demoReports = [
      {
        issueType: 'Incorrect room',
        description: 'HOD Computer Science Room is marked B201, but the label outside is HOD Office 201A.',
        message: 'HOD Computer Science Room is marked B201, but the label outside is HOD Office 201A.',
        status: 'Pending'
      },
      {
        issueType: 'Blocked path',
        description: 'Staircase B1 is closed for minor wiring updates on 2nd Floor level.',
        message: 'Staircase B1 is closed for minor wiring updates on 2nd Floor level.',
        status: 'In Progress'
      }
    ];

    const feedback = await Feedback.insertMany(demoReports);
    console.log(`Seeded ${feedback.length} user issues reports.`);

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
