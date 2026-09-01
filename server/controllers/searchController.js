const Room = require('../models/Room');
const Building = require('../models/Building');
const Landmark = require('../models/Landmark');

// @desc    Search rooms, buildings, and landmarks with intelligent ranking
// @route   GET /api/search
// @access  Public
const searchLocations = async (req, res, next) => {
  try {
    const rawQuery = req.query.q || '';
    const q = rawQuery.trim();

    if (!q) {
      return res.status(200).json({
        success: true,
        results: []
      });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // Query rooms and populate building/floor details
    const rooms = await Room.find({
      isActive: true,
      $or: [
        { name: regex },
        { roomNumber: regex },
        { department: regex },
        { roomType: regex },
        { description: regex }
      ]
    }).populate('buildingId', 'name code').populate('floorId', 'name floorCode floorNumber');

    // Query buildings
    const buildings = await Building.find({
      isActive: true,
      $or: [
        { name: regex },
        { code: regex },
        { description: regex }
      ]
    });

    // Query landmarks
    const landmarks = await Landmark.find({
      isActive: true,
      $or: [
        { name: regex },
        { type: regex },
        { description: regex }
      ]
    }).populate('buildingId', 'name code').populate('floorId', 'name floorCode floorNumber');

    // Format results
    const results = [];

    // Add rooms
    rooms.forEach(r => {
      // Calculate relevance score for ranking
      let score = 100;
      const lowerQ = q.toLowerCase();
      const lowerNum = (r.roomNumber || '').toLowerCase();
      const lowerName = (r.name || '').toLowerCase();

      if (lowerNum === lowerQ) score = 1000;
      else if (lowerName === lowerQ) score = 900;
      else if (lowerNum.startsWith(lowerQ)) score = 800;
      else if (lowerName.startsWith(lowerQ)) score = 700;
      else if (lowerNum.includes(lowerQ)) score = 600;
      else if (lowerName.includes(lowerQ)) score = 500;
      else score = 400;

      results.push({
        id: r.roomNumber || r._id,
        _id: r._id,
        roomNumber: r.roomNumber,
        type: 'room',
        name: r.name,
        category: r.roomType,
        department: r.department || '',
        building: r.buildingId?.name || 'SJT Building',
        buildingId: r.buildingId?.code || 'sjt-ground',
        floor: r.floorId?.name || `Floor ${r.floorId?.floorNumber || 0}`,
        floorNumber: r.floorId?.floorNumber || 0,
        coordinates: r.coordinates,
        score
      });
    });

    // Add landmarks
    landmarks.forEach(l => {
      let score = 300;
      const lowerQ = q.toLowerCase();
      const lowerName = (l.name || '').toLowerCase();
      if (lowerName === lowerQ) score = 850;
      else if (lowerName.startsWith(lowerQ)) score = 650;
      else if (lowerName.includes(lowerQ)) score = 450;

      results.push({
        id: l._id,
        _id: l._id,
        type: 'landmark',
        name: l.name,
        category: l.type,
        department: '',
        building: l.buildingId?.name || 'SJT Building',
        buildingId: l.buildingId?.code || 'sjt-ground',
        floor: l.floorId?.name || `Floor ${l.floorId?.floorNumber || 0}`,
        floorNumber: l.floorId?.floorNumber || 0,
        coordinates: l.coordinates,
        score
      });
    });

    // Add buildings
    buildings.forEach(b => {
      let score = 200;
      const lowerQ = q.toLowerCase();
      const lowerName = (b.name || '').toLowerCase();
      const lowerCode = (b.code || '').toLowerCase();
      if (lowerCode === lowerQ || lowerName === lowerQ) score = 950;

      results.push({
        id: b._id,
        _id: b._id,
        type: 'building',
        name: b.name,
        code: b.code,
        category: 'Building',
        description: b.description,
        score
      });
    });

    // Sort by relevance score descending
    results.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchLocations
};
