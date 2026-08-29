const Connection = require('../models/Connection');

/**
 * Builds an adjacency list representation of the indoor navigation graph.
 * @param {boolean} avoidStairs - If true, ignores staircase edges.
 * @returns {Promise<object>} Adjacency list mapping node ID -> [{ node, weight, edge }]
 */
const buildGraph = async (avoidStairs = false) => {
  try {
    // 1. Fetch active walkable edges from database
    const connections = await Connection.find({ isActive: true });
    const graph = {};

    connections.forEach((conn) => {
      // Filter out staircases if wheelchair accessibility is requested
      if (avoidStairs && conn.type === 'stairs') {
        return;
      }

      const { fromNode, toNode, distance } = conn;

      if (!graph[fromNode]) graph[fromNode] = [];
      if (!graph[toNode]) graph[toNode] = [];

      // Since connections are undirected (two-way halls)
      graph[fromNode].push({
        node: toNode,
        weight: distance,
        details: conn
      });

      graph[toNode].push({
        node: fromNode,
        weight: distance,
        details: conn
      });
    });

    return graph;
  } catch (err) {
    console.error('Error building navigation graph:', err);
    throw new Error('Failed to assemble navigation graph');
  }
};

module.exports = {
  buildGraph
};
