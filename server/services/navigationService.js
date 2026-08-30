const { buildGraph } = require('./graphService');
const Room = require('../models/Room');
const Landmark = require('../models/Landmark');
const Waypoint = require('../models/Waypoint');
const LogicalConnection = require('../models/LogicalConnection');
const Exit = require('../models/Exit');
const Hazard = require('../models/Hazard');
const Door = require('../models/Door');

// Configurable walking speed: 1.2 meters per second (average human pace)
const WALKING_SPEED_MPS = 1.2;

/**
 * Resolves a given room ID or landmark ID to its entry waypoint ID.
 */
const resolveToWaypointId = async (id) => {
  // If it's already a waypoint, return it
  const wp = await Waypoint.findOne({ waypointId: id });
  if (wp) return id;

  // Find room_to_corridor logical connection
  const conn = await LogicalConnection.findOne({ fromId: id, type: 'room_to_corridor' });
  if (conn && conn.waypointId) {
    return conn.waypointId;
  }

  // Check if it's an exit
  const exitConn = await LogicalConnection.findOne({ toId: id, type: 'corridor_to_vertical_egress' });
  if (exitConn && exitConn.waypointId) {
    return exitConn.waypointId;
  }

  const exitStairConn = await LogicalConnection.findOne({ fromId: id, type: 'stairs_to_exits' });
  if (exitStairConn) {
    // Find stair connector
    const stairConn = await LogicalConnection.findOne({ toId: id, type: 'corridor_to_vertical_egress' });
    if (stairConn && stairConn.waypointId) {
      return stairConn.waypointId;
    }
  }

  // Fallback Room lookups
  const room = await Room.findOne({ roomNumber: id });
  if (room) {
    const roomConn = await LogicalConnection.findOne({ fromId: room.roomNumber, type: 'room_to_corridor' });
    if (roomConn && roomConn.waypointId) {
      return roomConn.waypointId;
    }
  }

  return id;
};

const isPointInRect = (px, py, rx, ry, rw, rh) => {
  const EPSILON = 0.1; // tolerance
  return px > rx + EPSILON && px < rx + rw - EPSILON && py > ry + EPSILON && py < ry + rh - EPSILON;
};

const lineSegmentsIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  const u_b = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (u_b === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / u_b;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / u_b;
  return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
};

const lineIntersectsRect = (x1, y1, x2, y2, rx, ry, rw, rh) => {
  if (isPointInRect(x1, y1, rx, ry, rw, rh) || isPointInRect(x2, y2, rx, ry, rw, rh)) {
    return true;
  }
  const x3 = rx, y3 = ry;
  const x4 = rx + rw, y4 = ry;
  const x5 = rx, y5 = ry + rh;
  const x6 = rx + rw, y6 = ry + rh;

  return (
    lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) ||
    lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x5, y5) ||
    lineSegmentsIntersect(x1, y1, x2, y2, x4, y4, x6, y6) ||
    lineSegmentsIntersect(x1, y1, x2, y2, x5, y5, x6, y6)
  );
};

const validatePathGeometry = async (path, sourceRoomId, destRoomId) => {
  const rooms = await Room.find({ isActive: true });
  const waypoints = await Waypoint.find({});
  const exits = await Exit.find({});

  const wpMap = {};
  waypoints.forEach(w => {
    wpMap[w.waypointId] = { x: w.x, y: w.y };
  });
  exits.forEach(e => {
    wpMap[e.exitId] = { x: e.x, y: e.y };
  });

  const getRoomNumber = async (id) => {
    if (!id) return null;
    const r = await Room.findOne({ roomNumber: id }) || (id.match(/^[0-9a-fA-F]{24}$/) ? await Room.findById(id) : null);
    return r ? r.roomNumber : id;
  };
  
  const startRoomNumber = await getRoomNumber(sourceRoomId);
  const endRoomNumber = await getRoomNumber(destRoomId);

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];

    const p1 = wpMap[u];
    const p2 = wpMap[v];

    if (!p1 || !p2) continue;

    for (const room of rooms) {
      if (room.roomNumber === startRoomNumber || room.roomNumber === endRoomNumber) {
        continue;
      }

      const rx = room.coordinates.x;
      const ry = room.coordinates.y;
      const rw = room.width || 8.0;
      const rh = room.height || 10.0;

      if (lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, rx, ry, rw, rh)) {
        return { u, v };
      }
    }
  }

  return null;
};

/**
 * Dijkstra's shortest path calculator.
 */
const runDijkstra = (graph, startNode, endNode) => {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const queue = [];

  // Initialize
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;
  queue.push({ node: startNode, dist: 0 });

  while (queue.length > 0) {
    // Sort queue by distance (greedy)
    queue.sort((a, b) => a.dist - b.dist);
    const { node: currNode } = queue.shift();

    if (currNode === endNode) {
      break; // Destination found
    }

    if (visited.has(currNode)) continue;
    visited.add(currNode);

    const neighbors = graph[currNode] || [];
    for (const neighbor of neighbors) {
      const { node: neighborNode, weight } = neighbor;
      if (visited.has(neighborNode)) continue;

      const newDist = distances[currNode] + weight;
      if (newDist < distances[neighborNode]) {
        distances[neighborNode] = newDist;
        previous[neighborNode] = currNode;
        queue.push({ node: neighborNode, dist: newDist });
      }
    }
  }

  // Reconstruct path nodes sequence
  const path = [];
  let curr = endNode;
  while (curr) {
    path.push(curr);
    curr = previous[curr];
  }
  path.reverse();

  if (path[0] !== startNode) {
    return { path: [], distance: Infinity }; // No path available
  }

  return { path, distance: distances[endNode] };
};

/**
 * Maps Dijkstra nodes to routes response schema.
 */
const compileRouteDetails = async (graph, path, totalDistance, startNodeId, endNodeId) => {
  const pathPoints = {};
  const steps = [];
  const floorTransitions = [];

  // Fetch start/end room documents
  const startRoom = await Room.findOne({ roomNumber: startNodeId }) || (startNodeId.match(/^[0-9a-fA-F]{24}$/) ? await Room.findById(startNodeId) : null) || await Landmark.findById(startNodeId);
  const endRoom = await Room.findOne({ roomNumber: endNodeId }) || (endNodeId.match(/^[0-9a-fA-F]{24}$/) ? await Room.findById(endNodeId) : null) || await Landmark.findById(endNodeId) || await Exit.findOne({ exitId: endNodeId });

  // Helper to get room center and door center coordinates
  const getRoomEntryPoints = async (room) => {
    if (!room || !room.roomNumber) return null;
    const conn = await LogicalConnection.findOne({ fromId: room.roomNumber, type: 'room_to_corridor' });
    if (!conn) return null;
    const door = await Door.findOne({ doorId: conn.doorId });
    if (!door) return null;
    
    const rx = room.coordinates.x;
    const ry = room.coordinates.y;
    const rw = room.width || 8.0;
    const rh = room.height || 10.0;
    
    // Room center
    const rc = { x: rx + rw / 2, y: ry + rh / 2 };
    // Door center
    const dc = { x: door.x + (door.width || 1.0) / 2, y: door.y + (door.height || 1.0) / 2 };
    
    return { rc, dc };
  };

  const startEntry = await getRoomEntryPoints(startRoom);
  const endEntry = await getRoomEntryPoints(endRoom);

  steps.push({
    instruction: `Depart from ${startRoom ? startRoom.name : startNodeId}.`,
    type: 'straight',
    floor: 0
  });

  pathPoints[0] = [];

  // 1. Prepend starting room points: Room Center -> Door Center
  if (startEntry) {
    pathPoints[0].push(startEntry.rc);
    pathPoints[0].push(startEntry.dc);
  }

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];

    const neighbor = (graph[u] || []).find((n) => n.node === v);
    if (!neighbor) continue;

    const edge = neighbor.details;
    const edgeFloor = edge.floor !== undefined ? edge.floor : 0;
    
    if (!pathPoints[edgeFloor]) {
      pathPoints[edgeFloor] = [];
    }
    
    // Add pathPoints coordinates
    edge.pathPoints.forEach((p) => {
      pathPoints[edgeFloor].push({ x: p.x, y: p.y });
    });

    // Generate directional guide instructions
    let directionType = 'straight';
    let stepText = `Walk ${Math.round(edge.distance)} meters through the corridor.`;
    
    if (edge.type === 'stairs') {
      directionType = 'up-stairs';
      stepText = `Take the staircase toward exit.`;
    } else if (edge.type === 'elevator') {
      directionType = 'elevator';
      stepText = `Use elevator to transit.`;
    } else if (edge.type === 'door') {
      stepText = `Pass through the door doorway entrance.`;
    }

    steps.push({
      instruction: stepText,
      type: directionType,
      floor: edgeFloor
    });
  }

  // 2. Append destination room points: Door Center -> Room Center
  if (endEntry) {
    pathPoints[0].push(endEntry.dc);
    pathPoints[0].push(endEntry.rc);
  }

  steps.push({
    instruction: `Arrive at ${endRoom ? endRoom.name : endNodeId}. Destination is ahead.`,
    type: 'destination',
    floor: 0
  });

  // Calculate ETA in minutes
  const estimatedTime = Math.ceil(totalDistance / (WALKING_SPEED_MPS * 60));

  return {
    distance: Math.round(totalDistance),
    estimatedTime,
    steps,
    pathPoints,
    floorTransitions
  };
};

/**
 * Calculates shortest path and alternative path options.
 */
const calculateRoute = async (sourceId, destinationId, preferences = {}) => {
  const { avoidStairs } = preferences;

  // 1. Resolve architectural identifiers to waypoint nodes
  const startWp = await resolveToWaypointId(sourceId);
  const endWp = await resolveToWaypointId(destinationId);

  // 2. Build adjacency list graph from database (filtering hazards)
  const graph = await buildGraph(avoidStairs);

  // 3. Find primary route with validation loop
  let attempts = 0;
  const maxAttempts = 10;
  let primaryResult = null;
  const graphClone = JSON.parse(JSON.stringify(graph));

  while (attempts < maxAttempts) {
    primaryResult = runDijkstra(graphClone, startWp, endWp);

    if (primaryResult.distance === Infinity) {
      throw new Error('No available route was found between these locations.');
    }

    const invalidEdge = await validatePathGeometry(primaryResult.path, sourceId, destinationId);
    if (!invalidEdge) {
      break; // Path is valid!
    }

    // Prune the invalid edge
    const { u, v } = invalidEdge;
    if (graphClone[u]) {
      graphClone[u] = graphClone[u].filter(n => n.node !== v);
    }
    if (graphClone[v]) {
      graphClone[v] = graphClone[v].filter(n => n.node !== u);
    }
    attempts++;
  }

  // 4. Compile primary route response details
  const primaryRoute = await compileRouteDetails(
    graph,
    primaryResult.path,
    primaryResult.distance,
    sourceId,
    destinationId
  );

  // 5. Calculate alternative route if there are more than 3 nodes in the path
  const alternativeRoutes = [];
  if (primaryResult.path.length > 3) {
    try {
      const middleIdx = Math.floor(primaryResult.path.length / 2);
      const u = primaryResult.path[middleIdx - 1];
      const v = primaryResult.path[middleIdx];

      // Clone graph and remove the middle edge to find an alternative
      const altGraph = JSON.parse(JSON.stringify(graph));
      if (altGraph[u]) {
        altGraph[u] = altGraph[u].filter((n) => n.node !== v);
      }
      if (altGraph[v]) {
        altGraph[v] = altGraph[v].filter((n) => n.node !== u);
      }

      let altAttempts = 0;
      let altResult = { path: [], distance: Infinity };

      while (altAttempts < maxAttempts) {
        altResult = runDijkstra(altGraph, startWp, endWp);
        if (altResult.distance === Infinity) break;

        const invalidAltEdge = await validatePathGeometry(altResult.path, sourceId, destinationId);
        if (!invalidAltEdge) {
          break; // Valid alt route found!
        }

        // Prune the invalid alt edge
        const { u: au, v: av } = invalidAltEdge;
        if (altGraph[au]) altGraph[au] = altGraph[au].filter(n => n.node !== av);
        if (altGraph[av]) altGraph[av] = altGraph[av].filter(n => n.node !== au);
        altAttempts++;
      }

      if (altResult.distance !== Infinity && altResult.distance !== primaryResult.distance) {
        const altRoute = await compileRouteDetails(
          altGraph,
          altResult.path,
          altResult.distance,
          sourceId,
          destinationId
        );
        alternativeRoutes.push(altRoute);
      }
    } catch (err) {
      console.warn('Failed to calculate alternative route:', err.message);
    }
  }

  return {
    success: true,
    data: {
      sourceId,
      destinationId,
      ...primaryRoute,
      alternativeRoutes
    }
  };
};

/**
 * Emergency Evacuation Route Planner.
 * Computes shortest safe path to the nearest reachable exit, avoiding blocking hazards.
 */
const calculateEvacuationRoute = async (sourceId, preferences = {}) => {
  const { avoidStairs } = preferences;

  // 1. Resolve start location to waypoint
  const startWp = await resolveToWaypointId(sourceId);

  // 2. Build graph with active hazards filtered out
  const graph = await buildGraph(avoidStairs);

  // 3. Define target exit waypoints based on SJT Ground Floor connections
  const exitWaypoints = [
    { exitId: 'E1', wpId: 'WP_S1', name: 'North West Exit' },
    { exitId: 'E2', wpId: 'WP_S2', name: 'North East Exit' },
    { exitId: 'E3', wpId: 'WP_E3', name: 'East Side Exit' },
    { exitId: 'E4', wpId: 'WP_S3', name: 'South Exit' }
  ];

  let bestExit = null;
  let shortestDistance = Infinity;
  let bestPath = [];

  // 4. Test Dijkstra path to each exit waypoint with validation
  for (const exit of exitWaypoints) {
    let attempts = 0;
    const maxAttempts = 5;
    const graphClone = JSON.parse(JSON.stringify(graph));
    let pathResult = { path: [], distance: Infinity };

    while (attempts < maxAttempts) {
      pathResult = runDijkstra(graphClone, startWp, exit.wpId);
      if (pathResult.distance === Infinity) break;

      const invalidEdge = await validatePathGeometry(pathResult.path, sourceId, exit.exitId);
      if (!invalidEdge) {
        break; // Valid route to this exit found!
      }

      // Prune
      const { u, v } = invalidEdge;
      if (graphClone[u]) graphClone[u] = graphClone[u].filter(n => n.node !== v);
      if (graphClone[v]) graphClone[v] = graphClone[v].filter(n => n.node !== u);
      attempts++;
    }

    if (pathResult.distance < shortestDistance) {
      shortestDistance = pathResult.distance;
      bestPath = pathResult.path;
      bestExit = exit;
    }
  }

  if (shortestDistance === Infinity || !bestExit) {
    throw new Error('No safe route is currently available. All exits are blocked.');
  }

  // 5. Compile route details
  const routeDetails = await compileRouteDetails(
    graph,
    bestPath,
    shortestDistance,
    sourceId,
    bestExit.exitId
  );

  // 6. Gather active hazards that were avoided by this path
  const activeHazards = await Hazard.find({ isActive: true });
  const hazardsAvoided = activeHazards.map(h => h.type + ' at ' + h.locationId);

  return {
    success: true,
    data: {
      sourceId,
      destinationId: bestExit.exitId,
      bestExit: bestExit.name,
      hazardsAvoided,
      ...routeDetails
    }
  };
};

module.exports = {
  calculateRoute,
  calculateEvacuationRoute
};
