/**
 * Route Geometry Validator
 * Validates that indoor navigation routes strictly travel via corridors and junctions,
 * never penetrating room boundaries, classroom interiors, or physical walls.
 */

const EPSILON = 0.05; // Tolerance margin in meters

/**
 * Checks if a 2D point lies strictly inside a room rectangle.
 */
const isPointInRoom = (px, py, rx, ry, rw, rh, margin = EPSILON) => {
  return (
    px > rx + margin &&
    px < rx + rw - margin &&
    py > ry + margin &&
    py < ry + rh - margin
  );
};

/**
 * Checks if two line segments (p1-p2 and p3-p4) intersect.
 */
const lineSegmentsIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 1e-9) return false; // Parallel lines

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua > 0 && ua < 1 && ub > 0 && ub < 1;
};

/**
 * Checks if a route line segment between (x1, y1) and (x2, y2) crosses or enters a room.
 */
const segmentCrossesRoom = (x1, y1, x2, y2, room) => {
  const rx = room.coordinates ? room.coordinates.x : room.x;
  const ry = room.coordinates ? room.coordinates.y : room.y;
  const rw = room.width || 8.0;
  const rh = room.height || 10.0;

  // Check if either endpoint lies strictly inside the room
  if (isPointInRoom(x1, y1, rx, ry, rw, rh) || isPointInRoom(x2, y2, rx, ry, rw, rh)) {
    return true;
  }

  // Check midpoint to catch segments that pass entirely through the room
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  if (isPointInRoom(midX, midY, rx, ry, rw, rh)) {
    return true;
  }

  // Room perimeter segments
  const corners = [
    { x: rx, y: ry },
    { x: rx + rw, y: ry },
    { x: rx + rw, y: ry + rh },
    { x: rx, y: ry + rh }
  ];

  for (let i = 0; i < 4; i++) {
    const p3 = corners[i];
    const p4 = corners[(i + 1) % 4];
    if (lineSegmentsIntersect(x1, y1, x2, y2, p3.x, p3.y, p4.x, p4.y)) {
      return true;
    }
  }

  return false;
};

/**
 * Validates an entire route polyline against an array of room geometries.
 * Ignores collisions with start and destination rooms if specified.
 */
const validateRouteGeometry = (pathPoints, rooms, allowedRoomIds = []) => {
  if (!pathPoints || pathPoints.length < 2) {
    return { isValid: true };
  }

  const allowedSet = new Set(allowedRoomIds.filter(Boolean));

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];

    for (const room of rooms) {
      const roomId = room.roomNumber || room.id;
      if (allowedSet.has(roomId)) {
        continue;
      }

      if (segmentCrossesRoom(p1.x, p1.y, p2.x, p2.y, room)) {
        return {
          isValid: false,
          violatingRoom: roomId,
          segmentIndex: i,
          fromPoint: p1,
          toPoint: p2
        };
      }
    }
  }

  return { isValid: true };
};

module.exports = {
  isPointInRoom,
  lineSegmentsIntersect,
  segmentCrossesRoom,
  validateRouteGeometry
};
