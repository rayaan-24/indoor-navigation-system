const { buildGraph } = require('./graphService');
const Room = require('../models/Room');
const Landmark = require('../models/Landmark');

// Configurable walking speed: 1.2 meters per second (average human pace)
const WALKING_SPEED_MPS = 1.2;

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
  const endRoom = await Room.findOne({ roomNumber: endNodeId }) || await Landmark.findById(endNodeId);

  steps.push({
    instruction: `Depart from ${startRoom ? startRoom.name : startNodeId}.`,
    type: 'straight',
    floor: startRoom?.floorId?.floorNumber || 0
  });

  let currentFloor = startRoom?.floorId?.floorNumber || 0;

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];

    const neighbor = (graph[u] || []).find((n) => n.node === v);
    if (!neighbor) continue;

    const edge = neighbor.details;

    // Compile floor path coordinates
    const edgeFloor = edge.floor;
    if (!pathPoints[edgeFloor]) {
      pathPoints[edgeFloor] = [];
    }
    
    // Add pathPoints coordinates
    edge.pathPoints.forEach((p) => {
      pathPoints[edgeFloor].push({ x: p.x, y: p.y });
    });

    // Detect floor change
    // Fetch target node to compare floor indexes
    const nodeDetails = await Room.findOne({ roomNumber: v }) || await Landmark.findById(v);
    const targetFloor = nodeDetails?.floorId?.floorNumber || nodeDetails?.floor || edge.floor;

    if (targetFloor !== currentFloor) {
      const transitionType = edge.type === 'elevator' ? 'elevator' : 'up-stairs';
      const transitionDir = targetFloor > currentFloor ? 'up-stairs' : 'down-stairs';
      
      steps.push({
        instruction: `Use the ${edge.type === 'elevator' ? 'Elevator' : 'Staircase'} to go to Floor ${targetFloor}.`,
        type: edge.type === 'elevator' ? 'elevator' : transitionDir,
        floor: targetFloor
      });

      floorTransitions.push({
        type: 'floor-transition',
        fromFloor: `Floor ${currentFloor}`,
        toFloor: `Floor ${targetFloor}`,
        via: edge.type === 'elevator' ? 'Elevator' : 'Staircase'
      });

      currentFloor = targetFloor;
    } else {
      steps.push({
        instruction: `Walk ${edge.distance} meters through the ${edge.type === 'corridor' ? 'corridor' : edge.type}.`,
        type: 'straight',
        floor: currentFloor
      });
    }
  }

  steps.push({
    instruction: `Arrive at ${endRoom ? endRoom.name : endNodeId}. Destination is ahead.`,
    type: 'destination',
    floor: currentFloor
  });

  // Calculate ETA (Estimated Time of Arrival) in minutes
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

  // 1. Build adjacency list graph from database
  const graph = await buildGraph(avoidStairs);

  // 2. Find primary route
  const primaryResult = runDijkstra(graph, sourceId, destinationId);

  if (primaryResult.distance === Infinity) {
    throw new Error('No available route was found between these locations.');
  }

  // 3. Compile primary route response
  const primaryRoute = await compileRouteDetails(
    graph,
    primaryResult.path,
    primaryResult.distance,
    sourceId,
    destinationId
  );

  // 4. Calculate alternative route if there are more than 3 nodes in the path
  const alternativeRoutes = [];
  if (primaryResult.path.length > 3) {
    try {
      // Find a central connection to block temporarily
      const middleIdx = Math.floor(primaryResult.path.length / 2);
      const u = primaryResult.path[middleIdx - 1];
      const v = primaryResult.path[middleIdx];

      // Clone graph and remove the edge u-v to trigger path recalculation
      const altGraph = JSON.parse(JSON.stringify(graph));
      if (altGraph[u]) {
        altGraph[u] = altGraph[u].filter((n) => n.node !== v);
      }
      if (altGraph[v]) {
        altGraph[v] = altGraph[v].filter((n) => n.node !== u);
      }

      const altResult = runDijkstra(altGraph, sourceId, destinationId);
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

module.exports = {
  calculateRoute
};
