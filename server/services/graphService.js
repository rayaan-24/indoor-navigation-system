const Connection = require('../models/Connection');
const Hazard = require('../models/Hazard');
const Waypoint = require('../models/Waypoint');
const Corridor = require('../models/Corridor');
const Room = require('../models/Room');
const Stair = require('../models/Stair');
const Lift = require('../models/Lift');
const Exit = require('../models/Exit');

// Utility to check if a point is within a rectangle
const isPointInRect = (px, py, rx, ry, rw, rh) => {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
};

// Calculate Euclidean distance between two points
const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

/**
 * Builds an adjacency list representation of the indoor navigation graph.
 * Applies active emergency/hazard rules (blocking and weighted costs).
 * @param {boolean} avoidStairs - If true, ignores staircase edges.
 * @returns {Promise<object>} Adjacency list mapping node ID -> [{ node, weight, details }]
 */
const buildGraph = async (avoidStairs = false) => {
  try {
    // 1. Fetch building elements for geometric and spatial matching
    const connections = await Connection.find({ isActive: true });
    const hazards = await Hazard.find({ isActive: true });
    const waypoints = await Waypoint.find({});
    const corridors = await Corridor.find({});
    const rooms = await Room.find({});
    const stairs = await Stair.find({});
    const lifts = await Lift.find({});
    const exits = await Exit.find({});

    // 2. Index waypoints by ID for quick coordinate lookups
    const waypointMap = {};
    waypoints.forEach(wp => {
      waypointMap[wp.waypointId] = { x: wp.x, y: wp.y };
    });
    // Add exits to waypoint coordinates map
    exits.forEach(ex => {
      waypointMap[ex.exitId] = { x: ex.x, y: ex.y };
    });

    // Helper: Find element rectangle by ID
    const findElementRect = (id) => {
      const corr = corridors.find(c => c.corridorId === id);
      if (corr) return { x: corr.x, y: corr.y, w: corr.width, h: corr.height };

      const rm = rooms.find(r => r.roomNumber === id);
      if (rm) return { x: rm.coordinates.x, y: rm.coordinates.y, w: rm.width, h: rm.height };

      const st = stairs.find(s => s.stairId === id);
      if (st) return { x: st.x, y: st.y, w: st.width, h: st.height };

      const lf = lifts.find(l => l.liftId === id);
      if (lf) return { x: lf.x, y: lf.y, w: lf.width, h: lf.height };

      const ex = exits.find(e => e.exitId === id);
      if (ex) return { x: ex.x, y: ex.y, w: ex.width, h: ex.height };

      return null;
    };

    // 3. Process active hazards to identify blocked nodes and penalized regions
    const blockedWaypoints = new Set();
    const blockingRects = [];
    const weightedRects = []; // Array of { rect, weight, type }

    // Fire safety constants
    const FIRE_SAFETY_RADIUS_M = 3.0; // Any waypoint within 3m of fire source is unsafe

    hazards.forEach(hazard => {
      let hx = hazard.x;
      let hy = hazard.y;
      const rect = findElementRect(hazard.locationId);

      // If hazard is placed on an element (room/corridor/etc.), resolve its center
      if (rect) {
        if (hx === undefined || hx === null) hx = rect.x + rect.w / 2;
        if (hy === undefined || hy === null) hy = rect.y + rect.h / 2;
      } else if (waypointMap[hazard.locationId]) {
        if (hx === undefined || hx === null) hx = waypointMap[hazard.locationId].x;
        if (hy === undefined || hy === null) hy = waypointMap[hazard.locationId].y;
      }

      // Check if hazard blocks or penalizes
      const isBlocking = ['FIRE', 'BLOCKAGE', 'GAS'].includes(hazard.type);

      if (isBlocking) {
        // Record element rect for boundary blocking
        if (rect) {
          blockingRects.push(rect);
        }
        // Block waypoint if hazard is placed directly on it
        if (waypointMap[hazard.locationId]) {
          blockedWaypoints.add(hazard.locationId);
        }

        // Calculate threat radius
        let threatRadius = hazard.radius || 0;
        if (hazard.type === 'FIRE') {
          // FIRE: default radius 2m + safety radius 3m = 5m total threat radius
          threatRadius = 2.0 + FIRE_SAFETY_RADIUS_M;
        } else if (hazard.type === 'GAS') {
          threatRadius = 3.0;
        }

        // Scan and block waypoints within threat radius
        if (hx !== undefined && hy !== undefined && threatRadius > 0) {
          waypoints.forEach(wp => {
            const dist = getDistance(wp.x, wp.y, hx, hy);
            if (dist <= threatRadius) {
              blockedWaypoints.add(wp.waypointId);
            }
          });
        }
      } else {
        // Weighted hazard (SMOKE, CROWD)
        const penaltyWeight = hazard.type === 'SMOKE' ? 5 : 3; // defaults from rules
        if (rect) {
          weightedRects.push({ rect, weight: hazard.weight || penaltyWeight, type: hazard.type });
        }
        if (waypointMap[hazard.locationId]) {
          // If placed on waypoint, penalize the waypoint
          weightedRects.push({
            rect: { x: hx - 0.5, y: hy - 0.5, w: 1, h: 1 },
            weight: hazard.weight || penaltyWeight,
            type: hazard.type
          });
        }
      }
    });

    // 4. Build adjacency list representation of the graph
    const graph = {};

    connections.forEach((conn) => {
      // Accessibility check: Skip stairs if wheelchair navigation is active
      if (avoidStairs && conn.type === 'stairs') {
        return;
      }

      const { fromNode, toNode, distance } = conn;

      // Skip connection if either node is explicitly blocked/unsafe
      if (blockedWaypoints.has(fromNode) || blockedWaypoints.has(toNode)) {
        return;
      }

      // Check if endpoints lie within any blocked room or corridor rectangle
      const fromCoords = waypointMap[fromNode];
      const toCoords = waypointMap[toNode];

      if (fromCoords && toCoords) {
        // Skip if either endpoint is inside a blocked area
        const isFromBlocked = blockingRects.some(r => isPointInRect(fromCoords.x, fromCoords.y, r.x, r.y, r.w, r.h));
        const isToBlocked = blockingRects.some(r => isPointInRect(toCoords.x, toCoords.y, r.x, r.y, r.w, r.h));
        if (isFromBlocked || isToBlocked) {
          return;
        }
      }

      // Calculate path cost (with penalties for smoke/crowds)
      let traversalCost = distance;

      if (fromCoords && toCoords) {
        weightedRects.forEach(({ rect, weight }) => {
          const isFromWeighted = isPointInRect(fromCoords.x, fromCoords.y, rect.x, rect.y, rect.w, rect.h);
          const isToWeighted = isPointInRect(toCoords.x, toCoords.y, rect.x, rect.y, rect.w, rect.h);
          
          if (isFromWeighted || isToWeighted) {
            // Apply flat penalty to the edge cost (e.g. +5 for smoke, +3 for crowd)
            traversalCost += weight;
          }
        });
      }

      // Initialize adjacency mapping arrays
      if (!graph[fromNode]) graph[fromNode] = [];
      if (!graph[toNode]) graph[toNode] = [];

      graph[fromNode].push({
        node: toNode,
        weight: traversalCost,
        details: conn
      });

      graph[toNode].push({
        node: fromNode,
        weight: traversalCost,
        details: conn
      });
    });

    return graph;
  } catch (err) {
    console.error('Error building hazard-aware navigation graph:', err);
    throw new Error('Failed to assemble navigation graph');
  }
};

module.exports = {
  buildGraph
};
