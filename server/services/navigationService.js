const { buildGraph } = require('./graphService');
const { segmentCrossesRoom, validateRouteGeometry } = require('./routeGeometryValidator');
const Room = require('../models/Room');
const Landmark = require('../models/Landmark');
const Waypoint = require('../models/Waypoint');
const LogicalConnection = require('../models/LogicalConnection');
const Exit = require('../models/Exit');
const Hazard = require('../models/Hazard');
const Door = require('../models/Door');

// Average walking pace: 1.2 meters/second (~72 meters/minute)
const WALKING_SPEED_MPS = 1.2;

/**
 * Resolves a given room ID or landmark ID to its corridor door entry waypoint ID.
 */
const resolveToWaypointId = async (id) => {
  if (!id) return id;

  // 1. Direct waypoint check
  const wp = await Waypoint.findOne({ waypointId: id });
  if (wp) return id;

  // 2. Direct Door check
  const door = await Door.findOne({ doorId: id });
  if (door) {
    const doorConn = await LogicalConnection.findOne({ doorId: door.doorId, type: 'room_to_corridor' });
    if (doorConn && doorConn.waypointId) return doorConn.waypointId;
  }

  // 3. Room to corridor connection by room number (e.g. "G01", "G07")
  const conn = await LogicalConnection.findOne({ fromId: id, type: 'room_to_corridor' });
  if (conn && conn.waypointId) {
    return conn.waypointId;
  }

  // 4. Room lookup by MongoDB ObjectId or roomNumber
  const room = (id.match(/^[0-9a-fA-F]{24}$/) ? await Room.findById(id) : null) || await Room.findOne({ roomNumber: id });
  if (room) {
    const roomConn = await LogicalConnection.findOne({ fromId: room.roomNumber, type: 'room_to_corridor' });
    if (roomConn && roomConn.waypointId) {
      return roomConn.waypointId;
    }
  }

  // 5. Exit or Egress check
  const exitConn = await LogicalConnection.findOne({ toId: id, type: 'corridor_to_vertical_egress' });
  if (exitConn && exitConn.waypointId) {
    return exitConn.waypointId;
  }

  const exitStairConn = await LogicalConnection.findOne({ fromId: id, type: 'stairs_to_exits' });
  if (exitStairConn) {
    const stairConn = await LogicalConnection.findOne({ toId: id, type: 'corridor_to_vertical_egress' });
    if (stairConn && stairConn.waypointId) {
      return stairConn.waypointId;
    }
  }

  return id;
};

/**
 * Validates path geometry against all rooms in the building.
 */
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
    const r = (id.match(/^[0-9a-fA-F]{24}$/) ? await Room.findById(id) : null) || await Room.findOne({ roomNumber: id });
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

      if (segmentCrossesRoom(p1.x, p1.y, p2.x, p2.y, room)) {
        return { u, v, violatingRoom: room.roomNumber };
      }
    }
  }

  return null;
};

/**
 * Dijkstra shortest path algorithm.
 */
const runDijkstra = (graph, startNode, endNode) => {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const queue = [];

  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;
  queue.push({ node: startNode, dist: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { node: currNode } = queue.shift();

    if (currNode === endNode) {
      break;
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

  const path = [];
  let curr = endNode;
  while (curr) {
    path.push(curr);
    curr = previous[curr];
  }
  path.reverse();

  if (path[0] !== startNode) {
    return { path: [], distance: Infinity };
  }

  return { path, distance: distances[endNode] };
};

/**
 * Maps Dijkstra node path into a clean door-to-door corridor route response.
 */
const compileRouteDetails = async (graph, path, totalDistance, startNodeId, endNodeId) => {
  const pathPoints = {};
  const steps = [];
  const floorTransitions = [];

  // Fetch start/end room documents
  const startRoom = (startNodeId.match(/^[0-9a-fA-F]{24}$/) ? await Room.findById(startNodeId) : null) || await Room.findOne({ roomNumber: startNodeId }) || await Landmark.findById(startNodeId);
  const endRoom = (endNodeId.match(/^[0-9a-fA-F]{24}$/) ? await Room.findById(endNodeId) : null) || await Room.findOne({ roomNumber: endNodeId }) || await Landmark.findById(endNodeId) || await Exit.findOne({ exitId: endNodeId });

  // Waypoints coordinate mapping
  const waypoints = await Waypoint.find({});
  const exits = await Exit.find({});
  const wpMap = {};
  const wpLabelMap = {};

  waypoints.forEach(w => {
    wpMap[w.waypointId] = { x: w.x, y: w.y };
    wpLabelMap[w.waypointId] = w.label || w.waypointId;
  });
  exits.forEach(e => {
    wpMap[e.exitId] = { x: e.x, y: e.y };
    wpLabelMap[e.exitId] = e.name || e.exitId;
  });

  // 1. Build coordinate polyline: strictly from Source Door Waypoint to Destination Door Waypoint
  pathPoints[0] = path.map(nodeId => wpMap[nodeId]).filter(Boolean);

  // 2. Generate Step-by-Step Directions
  const startName = startRoom ? startRoom.name : startNodeId;
  const endName = endRoom ? endRoom.name : endNodeId;

  steps.push({
    instruction: `Depart from the entrance of ${startName}.`,
    type: 'straight',
    floor: 0
  });

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];

    const p1 = wpMap[u];
    const p2 = wpMap[v];
    const segDist = p1 && p2 ? Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y) * 10) / 10 : 0;

    let stepText = `Walk ${Math.round(segDist)} meters along the corridor.`;
    let directionType = 'straight';

    if (v.startsWith('J_')) {
      stepText = `Continue ${Math.round(segDist)}m toward ${wpLabelMap[v] || 'corridor junction'}.`;
    } else if (v.startsWith('WP_S')) {
      directionType = 'up-stairs';
      stepText = `Head ${Math.round(segDist)}m toward ${wpLabelMap[v] || 'staircase'}.`;
    } else if (v.startsWith('E') || v === 'WP_E3') {
      stepText = `Proceed ${Math.round(segDist)}m toward exit doorway.`;
    } else if (v.startsWith('WP_L') || v === 'L1') {
      directionType = 'elevator';
      stepText = `Proceed ${Math.round(segDist)}m to elevator.`;
    } else if (i === path.length - 2) {
      stepText = `Approach entrance of ${endName}.`;
    }

    steps.push({
      instruction: stepText,
      type: directionType,
      floor: 0
    });
  }

  steps.push({
    instruction: `Arrive at the entrance of ${endName}. Destination is directly ahead.`,
    type: 'destination',
    floor: 0
  });

  // Calculate true Euclidean path distance if totalDistance is not provided
  let calculatedDistance = 0;
  for (let i = 0; i < pathPoints[0].length - 1; i++) {
    const p1 = pathPoints[0][i];
    const p2 = pathPoints[0][i + 1];
    calculatedDistance += Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }
  const finalDistance = Math.round(calculatedDistance || totalDistance);
  const estimatedTime = Math.max(1, Math.ceil(finalDistance / (WALKING_SPEED_MPS * 60)));

  return {
    distance: finalDistance,
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

  if (!startWp || !endWp) {
    throw new Error('Could not resolve starting or destination location door waypoints.');
  }

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

  // 5. Calculate alternative route if path is long enough
  const alternativeRoutes = [];
  if (primaryResult.path.length > 3) {
    try {
      const middleIdx = Math.floor(primaryResult.path.length / 2);
      const u = primaryResult.path[middleIdx - 1];
      const v = primaryResult.path[middleIdx];

      const altGraph = JSON.parse(JSON.stringify(graph));
      if (altGraph[u]) altGraph[u] = altGraph[u].filter(n => n.node !== v);
      if (altGraph[v]) altGraph[v] = altGraph[v].filter(n => n.node !== u);

      let altAttempts = 0;
      let altResult = { path: [], distance: Infinity };

      while (altAttempts < maxAttempts) {
        altResult = runDijkstra(altGraph, startWp, endWp);
        if (altResult.distance === Infinity) break;

        const invalidAltEdge = await validatePathGeometry(altResult.path, sourceId, destinationId);
        if (!invalidAltEdge) {
          break;
        }

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
 */
const calculateEvacuationRoute = async (sourceId, preferences = {}) => {
  const { avoidStairs } = preferences;
  const startWp = await resolveToWaypointId(sourceId);
  const graph = await buildGraph(avoidStairs);

  const exitWaypoints = [
    { exitId: 'E1', wpId: 'WP_S1', name: 'North West Exit' },
    { exitId: 'E2', wpId: 'WP_S2', name: 'North East Exit' },
    { exitId: 'E3', wpId: 'WP_E3', name: 'East Side Exit' },
    { exitId: 'E4', wpId: 'WP_S3', name: 'South Exit' }
  ];

  let bestExit = null;
  let shortestDistance = Infinity;
  let bestPath = [];

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
        break;
      }

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

  const routeDetails = await compileRouteDetails(
    graph,
    bestPath,
    shortestDistance,
    sourceId,
    bestExit.exitId
  );

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
