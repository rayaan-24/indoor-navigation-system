const Room = require('../models/Room');
const Building = require('../models/Building');
const Floor = require('../models/Floor');

// @desc    Get all rooms (supports query filters)
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const { building, floor, type, query } = req.query;
    let findQuery = { isActive: true };

    // Building filter
    if (building && building !== 'all') {
      if (building.match(/^[0-9a-fA-F]{24}$/)) {
        findQuery.buildingId = building;
      } else {
        // Find building by code
        const b = await Building.findOne({ code: building });
        if (b) findQuery.buildingId = b._id;
      }
    }

    // Floor filter
    if (floor && floor !== 'all') {
      findQuery.floor = Number(floor); // Keep in mind we store floor as a number in Room schema
    }

    // Room Type category filter
    if (type && type !== 'all') {
      findQuery.roomType = type;
    }

    // Free text query search
    if (query) {
      findQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { roomNumber: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    const rooms = await Room.find(findQuery)
      .populate('buildingId', 'name code')
      .populate('floorId', 'name floorCode');

    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    // Attempt find by standard ObjectId first, fall back to string custom room ID (e.g. 'b-comp-lab-204')
    let room;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      room = await Room.findById(req.params.id)
        .populate('buildingId', 'name code')
        .populate('floorId', 'name floorCode');
    } else {
      room = await Room.findOne({ roomNumber: req.params.id }) || await Room.findOne({ _id: req.params.id }) || await Room.findOne({ name: req.params.id });
      if (room) {
        // Repopulate
        room = await Room.findById(room._id)
          .populate('buildingId', 'name code')
          .populate('floorId', 'name floorCode');
      }
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rooms by Floor ID
// @route   GET /api/floors/:floorId/rooms
// @access  Public
const getRoomsByFloor = async (req, res, next) => {
  try {
    let floorQuery = req.params.floorId;
    let query = { isActive: true };

    if (floorQuery.match(/^[0-9a-fA-F]{24}$/)) {
      query.floorId = floorQuery;
    } else {
      const fl = await Floor.findOne({ floorCode: floorQuery });
      if (!fl) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }
      query.floorId = fl._id;
    }

    const rooms = await Room.find(query);
    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rooms by Building ID
// @route   GET /api/buildings/:buildingId/rooms
// @access  Public
const getRoomsByBuilding = async (req, res, next) => {
  try {
    let buildingQuery = req.params.buildingId;
    let query = { isActive: true };

    if (buildingQuery.match(/^[0-9a-fA-F]{24}$/)) {
      query.buildingId = buildingQuery;
    } else {
      const b = await Building.findOne({ code: buildingQuery });
      if (!b) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }
      query.buildingId = b._id;
    }

    const rooms = await Room.find(query);
    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Admin
const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Admin
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    res.status(200).json({
      success: true,
      data: room,
      message: 'Room updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Admin
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Room deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  getRoomsByFloor,
  getRoomsByBuilding,
  createRoom,
  updateRoom,
  deleteRoom
};
