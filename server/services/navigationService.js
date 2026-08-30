const { buildGraph } = require('./graphService');
const Room = require('../models/Room');
const Landmark = require('../models/Landmark');
const Waypoint = require('../models/Waypoint');
const LogicalConnection = require('../models/LogicalConnection');
const Exit = require('../models/Exit');
const Hazard = require('../models/Hazard');

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

  // Fetch start/end room names
  const startRoom = await Room.findOne({ roomNumber: startNodeId }) || await Landmark.findById(startNodeId);
  const endRoom = await Room.findOne({ roomNumber: endNodeId }) || await Landmark.findById(endNodeId) || await Exit.findOne({ exitId: endNodeId });

  steps.push({
    instruction: `Depart from ${startRoom ? startRoom.name : startNodeId}.`,
    type: 'straight',
    floor: 0
  });

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

  // 3. Find primary route
  const primaryResult = runDijkstra(graph, startWp, endWp);

  if (primaryResult.distance === Infinity) {
    throw new Error('No available route was found between these locations.');
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

      const altResult = runDijkstra(altGraph, startWp, endWp);
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

  // 4. Test Dijkstra path to each exit waypoint
  for (const exit of exitWaypoints) {
    const result = runDijkstra(graph, startWp, exit.wpId);
    if (result.distance < shortestDistance) {
      shortestDistance = result.distance;
      bestPath = result.path;
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
