const Room = require('../models/Room');
const Building = require('../models/Building');
const Landmark = require('../models/Landmark');

// @desc    Search rooms, buildings, and landmarks
// @route   GET /api/search
// @access  Public
const searchLocations = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        results: []
      });
    }

    const regex = new RegExp(q, 'i');

    // Query rooms and populate building/floor details
    const rooms = await Room.find({
      isActive: true,
      $or: [
        { name: regex },
        { roomNumber: regex },
        { department: regex }
      ]
    }).populate('buildingId', 'name code').populate('floorId', 'name floorCode');

    // Query buildings
    const buildings = await Building.find({
      isActive: true,
      $or: [
        { name: regex },
        { code: regex }
      ]
    });

    // Query landmarks
    const landmarks = await Landmark.find({
      isActive: true,
      $or: [
        { name: regex },
        { type: regex }
      ]
    }).populate('buildingId', 'name code').populate('floorId', 'name floorCode');

    // Format results to a consistent, flat array
    const results = [];

    // Add rooms
    rooms.forEach(r => {
      results.push({
        id: r._id,
        roomNumber: r.roomNumber,
        type: 'room',
        name: r.name,
        category: r.roomType,
        building: r.buildingId?.name || '',
        buildingId: r.buildingId?.code || '',
        floor: r.floorId?.name || `Floor ${r.floorId?.floorNumber}`,
        floorNumber: r.floorId?.floorNumber || 0
      });
    });

    // Add buildings
    buildings.forEach(b => {
      results.push({
        id: b._id,
        type: 'building',
        name: b.name,
        code: b.code,
        category: 'Building',
        description: b.description
      });
    });

    // Add landmarks
    landmarks.forEach(l => {
      results.push({
        id: l._id,
        type: 'landmark',
        name: l.name,
        category: l.type,
        building: l.buildingId?.name || '',
        buildingId: l.buildingId?.code || '',
        floor: l.floorId?.name || `Floor ${l.floorId?.floorNumber}`,
        floorNumber: l.floorId?.floorNumber || 0
      });
    });

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
