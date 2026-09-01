const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Models
const User = require('../models/User');
const Building = require('../models/Building');
const Floor = require('../models/Floor');
const Room = require('../models/Room');
const Landmark = require('../models/Landmark');
const Route = require('../models/Route');
const Feedback = require('../models/Feedback');
const Connection = require('../models/Connection');
const Corridor = require('../models/Corridor');
const Stair = require('../models/Stair');
const Lift = require('../models/Lift');
const Exit = require('../models/Exit');
const Door = require('../models/Door');
const Waypoint = require('../models/Waypoint');
const LogicalConnection = require('../models/LogicalConnection');
const SensorMap = require('../models/SensorMap');
const Hazard = require('../models/Hazard');

// The authoritative SJT Ground Floor Map JSON Dataset
const mapDataset = {
  "building": {
    "name": "SJT Ground Floor - Metric Layout",
    "width": 120,
    "height": 94,
    "coordinate_system": "Cartesian top view, origin at top-left",
    "units": "meters",
    "meters_per_unit": 1,
    "display_scale": "1 unit = 1 meter",
    "pixels_per_meter": 12
  },
  "rooms": [
    { "id": "G01", "name": "Classroom G01", "department": "SITE", "x": 21.0, "y": 70.0, "width": 8.0, "height": 10.56, "area_sqft": 910, "area_sqm": 84.4960052, "capacity": 48 },
    { "id": "G02", "name": "Classroom G02", "department": "SITE", "x": 30.0, "y": 70.0, "width": 10.0, "height": 10.05, "area_sqft": 1052, "area_sqm": 100.5, "capacity": 56 },
    { "id": "G03", "name": "Classroom G03", "department": "SITE", "x": 40.0, "y": 70.0, "width": 10.0, "height": 10.05, "area_sqft": 1052, "area_sqm": 100.5, "capacity": 56 },
    { "id": "G04", "name": "Classroom G04", "department": "SITE", "x": 50.0, "y": 70.0, "width": 8.0, "height": 10.35, "area_sqft": 891, "area_sqm": 82.80026013, "capacity": 46 },
    { "id": "G05", "name": "Classroom G05", "department": "SITE", "x": 62.0, "y": 70.0, "width": 8.0, "height": 10.13, "area_sqft": 872, "area_sqm": 81.01077666, "capacity": 44 },
    { "id": "G06", "name": "Electrical Room", "department": "Facilities", "x": 71.5, "y": 48.0, "width": 4.0, "height": 7.01, "area_sqft": 302, "area_sqm": 28.05648458, "capacity": 4 },
    { "id": "G07", "name": "Smart Classroom", "department": "SITE", "x": 44.0, "y": 48.0, "width": 14.0, "height": 11.51, "area_sqft": 1734, "area_sqm": 161.0925307, "capacity": 90 },
    { "id": "G08", "name": "Classroom G08", "department": "SITE", "x": 62.0, "y": 48.0, "width": 6.8, "height": 8.14, "area_sqft": 596, "area_sqm": 55.36975102, "capacity": 28 },
    { "id": "G09", "name": "Boys Toilet", "department": "Amenities", "x": 100.0, "y": 27.0, "width": 8.0, "height": 8.37, "area_sqft": 721, "area_sqm": 66.98253437, "capacity": 18 },
    { "id": "G10", "name": "Classroom G10", "department": "SITE", "x": 100.0, "y": 37.5, "width": 7.5, "height": 10.05, "area_sqft": 811, "area_sqm": 75.34373839, "capacity": 40 },
    { "id": "G11", "name": "Dining Hall G11", "department": "Amenities", "x": 22.0, "y": 27.0, "width": 12.0, "height": 13.0, "area_sqft": 1679, "area_sqm": 155.982906, "capacity": 120 },
    { "id": "G12", "name": "Dining Hall G12", "department": "Amenities", "x": 66.0, "y": 27.0, "width": 12.0, "height": 13.0, "area_sqft": 1679, "area_sqm": 155.982906, "capacity": 120 },
    { "id": "G13", "name": "Canteen Arasan", "department": "Amenities", "x": 29.5, "y": 8.5, "width": 28.5, "height": 15.5, "area_sqft": 7620, "area_sqm": 707.9152731, "capacity": 320 },
    { "id": "G14", "name": "Classroom G14", "department": "SITE", "x": 10.5, "y": 38.0, "width": 7.5, "height": 10.05, "area_sqft": 811, "area_sqm": 75.34373839, "capacity": 40 },
    { "id": "G15", "name": "Girls Toilet", "department": "Amenities", "x": 10.5, "y": 27.0, "width": 7.5, "height": 9.33, "area_sqft": 753, "area_sqm": 69.95540691, "capacity": 18 },
    { "id": "G16", "name": "Classroom G16", "department": "SITE", "x": 10.0, "y": 59.6, "width": 8.0, "height": 10.4, "area_sqft": 896, "area_sqm": 83.24043107, "capacity": 44 },
    { "id": "G17", "name": "SD & Management Lab", "department": "SITE", "x": 6.0, "y": 47.5, "width": 12.0, "height": 12.75, "area_sqft": 1647, "area_sqm": 153.0100334, "capacity": 70 },
    { "id": "G18", "name": "Embedded & IoT Lab", "department": "SITE", "x": 21.0, "y": 48.0, "width": 9.5, "height": 10.0, "area_sqft": 1023, "area_sqm": 95.03901895, "capacity": 42 },
    { "id": "G18A", "name": "IP Lab", "department": "SITE", "x": 31.5, "y": 48.0, "width": 6.0, "height": 9.17, "area_sqft": 592, "area_sqm": 54.99814195, "capacity": 24 },
    { "id": "G19", "name": "Mobile App Development Lab", "department": "SITE", "x": 72.0, "y": 70.0, "width": 9.5, "height": 10.0, "area_sqft": 1023, "area_sqm": 95.03901895, "capacity": 42 },
    { "id": "G19A", "name": "Automation Lab", "department": "SITE", "x": 83.5, "y": 70.0, "width": 6.0, "height": 9.17, "area_sqft": 592, "area_sqm": 54.99814195, "capacity": 24 },
    { "id": "G20", "name": "Data Science Lab", "department": "SITE", "x": 84.8, "y": 48.0, "width": 12.0, "height": 12.75, "area_sqft": 1647, "area_sqm": 153.0100334, "capacity": 70 },
    { "id": "G21", "name": "Staff Toilet", "department": "Amenities", "x": 79.5, "y": 27.0, "width": 4.0, "height": 9.29, "area_sqft": 400, "area_sqm": 37.16090673, "capacity": 10 },
    { "id": "G22", "name": "Dean Office", "department": "SITE", "x": 35.0, "y": 27.0, "width": 9.1, "height": 10.0, "area_sqft": 980, "area_sqm": 91.04422148, "capacity": 18 },
    { "id": "G23", "name": "HOD Cabin - SITE", "department": "SITE", "x": 44.6, "y": 27.0, "width": 8.45, "height": 10.0, "area_sqft": 910, "area_sqm": 84.5410628, "capacity": 12 },
    { "id": "G24", "name": "Classroom G24", "department": "SITE", "x": 84.0, "y": 27.0, "width": 8.25, "height": 10.0, "area_sqft": 888, "area_sqm": 82.49721293, "capacity": 44 },
    { "id": "MISC", "name": "Store", "department": "Facilities", "x": 90.0, "y": 70.0, "width": 2.5, "height": 2.97, "area_sqft": 80, "area_sqm": 7.432181345, "capacity": 4 },
    { "id": "G26", "name": "Janitor's Store", "department": "Facilities", "x": 94.0, "y": 70.0, "width": 1.5, "height": 1.86, "area_sqft": 30, "area_sqm": 2.787068004, "capacity": 2 }
  ],
  "corridors": [
    { "id": "C1A", "name": "C1-1_Main_Corridor_North_Upper", "x": 58.0, "y": 16.0, "width": 4.0, "height": 8.0 },
    { "id": "C1B", "name": "C1-2_Main_Corridor_North_Lower", "x": 58.0, "y": 27.0, "width": 4.0, "height": 18.0 },
    { "id": "C1C", "name": "C1-3_Main_Corridor_South_Upper", "x": 58.0, "y": 48.0, "width": 4.0, "height": 19.0 },
    { "id": "C1D", "name": "C1-4_Main_Corridor_South_Lower", "x": 58.0, "y": 70.0, "width": 4.0, "height": 18.0 },
    { "id": "C2A", "name": "C2-1_Left_Wing_North_Upper", "x": 18.0, "y": 16.0, "width": 3.0, "height": 8.0 },
    { "id": "C2B", "name": "C2-2_Left_Wing_North_Lower", "x": 18.0, "y": 27.0, "width": 3.0, "height": 18.0 },
    { "id": "C2C", "name": "C2-3_Left_Wing_South_Upper", "x": 18.0, "y": 48.0, "width": 3.0, "height": 19.0 },
    { "id": "C2D", "name": "C2-4_Left_Wing_South_Lower", "x": 18.0, "y": 70.0, "width": 3.0, "height": 18.0 },
    { "id": "C3A", "name": "C3-1_Right_Wing_North_Upper", "x": 97.0, "y": 16.0, "width": 3.0, "height": 12.0 },
    { "id": "C3B", "name": "C3-2_Right_Wing_North_Lower", "x": 97.0, "y": 25.0, "width": 3.0, "height": 24.0 },
    { "id": "C3C", "name": "C3-3_Right_Wing_South_Upper", "x": 97.0, "y": 46.0, "width": 3.0, "height": 25.0 },
    { "id": "C3D", "name": "C3-4_Right_Wing_South_Lower", "x": 97.0, "y": 68.0, "width": 3.0, "height": 20.0 },
    { "id": "C4A", "name": "C4-1_North_Corridor_West", "x": 21.0, "y": 24.0, "width": 37.0, "height": 3.0 },
    { "id": "C4B", "name": "C4-2_North_Corridor_East", "x": 62.0, "y": 24.0, "width": 35.0, "height": 3.0 },
    { "id": "C5A", "name": "C5-1_Central_Corridor_West", "x": 21.0, "y": 45.0, "width": 37.0, "height": 3.0 },
    { "id": "C5B", "name": "C5-2_Central_Corridor_East", "x": 62.0, "y": 45.0, "width": 35.0, "height": 3.0 },
    { "id": "C6A", "name": "C6-1_South_Corridor_West", "x": 21.0, "y": 67.0, "width": 37.0, "height": 3.0 },
    { "id": "C6B", "name": "C6-2_South_Corridor_East", "x": 62.0, "y": 67.0, "width": 35.0, "height": 3.0 },
    { "id": "CJ_NW", "name": "Connector_North_West", "x": 18.0, "y": 24.0, "width": 3.0, "height": 3.0 },
    { "id": "CJ_NC", "name": "Connector_North_Core", "x": 58.0, "y": 24.0, "width": 4.0, "height": 3.0 },
    { "id": "CJ_NE", "name": "Connector_North_East", "x": 97.0, "y": 24.0, "width": 3.0, "height": 3.0 },
    { "id": "CJ_MW", "name": "Connector_Mid_West", "x": 18.0, "y": 45.0, "width": 3.0, "height": 3.0 },
    { "id": "CJ_MC", "name": "Connector_Mid_Core", "x": 58.0, "y": 45.0, "width": 4.0, "height": 3.0 },
    { "id": "CJ_ME", "name": "Connector_Mid_East", "x": 97.0, "y": 45.0, "width": 3.0, "height": 3.0 },
    { "id": "CJ_SW", "name": "Connector_South_West", "x": 18.0, "y": 67.0, "width": 3.0, "height": 3.0 },
    { "id": "CJ_SC", "name": "Connector_South_Core", "x": 58.0, "y": 67.0, "width": 4.0, "height": 3.0 },
    { "id": "CJ_SE", "name": "Connector_South_East", "x": 97.0, "y": 67.0, "width": 3.0, "height": 3.0 },
    { "id": "C7A", "name": "C7-1_North_West_Stair_Lobby", "x": 18.0, "y": 12.0, "width": 5.0, "height": 4.0 },
    { "id": "C7B", "name": "C7-2_North_East_Stair_Lobby", "x": 95.0, "y": 12.0, "width": 5.0, "height": 4.0 },
    { "id": "C7C", "name": "C7-3_East_Exit_Lobby", "x": 100.0, "y": 57.0, "width": 8.0, "height": 4.0 }
  ],
  "stairs": [
    { "id": "S1", "name": "North West Stair", "x": 22.0, "y": 10.0, "width": 6.0, "height": 8.0 },
    { "id": "S2", "name": "North East Stair", "x": 90.0, "y": 10.0, "width": 6.0, "height": 8.0 },
    { "id": "S3", "name": "South Stair", "x": 56.0, "y": 88.0, "width": 8.0, "height": 4.0 }
  ],
  "lifts": [
    { "id": "L1", "name": "Central Lift", "x": 54.0, "y": 39.0, "width": 4.0, "height": 6.0 }
  ],
  "exits": [
    { "id": "E1", "name": "North West Exit", "x": 18.0, "y": 10.0, "width": 4.0, "height": 2.0 },
    { "id": "E2", "name": "North East Exit", "x": 96.0, "y": 10.0, "width": 4.0, "height": 2.0 },
    { "id": "E3", "name": "East Side Exit", "x": 108.0, "y": 57.0, "width": 2.0, "height": 4.0 },
    { "id": "E4", "name": "South Exit", "x": 58.0, "y": 92.0, "width": 4.0, "height": 2.0 }
  ],
  "doors": [
    { "id": "D_G01", "name": "Door G01", "room_id": "G01", "corridor_id": "C6A", "x": 21.0, "y": 69.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G02", "name": "Door G02", "room_id": "G02", "corridor_id": "C6A", "x": 30.5, "y": 69.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G03", "name": "Door G03", "room_id": "G03", "corridor_id": "C6A", "x": 41.0, "y": 69.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G04", "name": "Door G04", "room_id": "G04", "corridor_id": "C6A", "x": 50.5, "y": 69.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G05", "name": "Door G05", "room_id": "G05", "corridor_id": "C6B", "x": 66.0, "y": 69.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G06", "name": "Door G06", "room_id": "G06", "corridor_id": "C5B", "x": 72.0, "y": 48.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G07", "name": "Door G07", "room_id": "G07", "corridor_id": "C5A", "x": 48.0, "y": 48.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G08", "name": "Door G08", "room_id": "G08", "corridor_id": "C5B", "x": 65.0, "y": 48.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G09", "name": "Door G09", "room_id": "G09", "corridor_id": "C3B", "x": 99.5, "y": 30.0, "width": 0.5, "height": 2.0, "orientation": "vertical" },
    { "id": "D_G10", "name": "Door G10", "room_id": "G10", "corridor_id": "C3B", "x": 99.5, "y": 41.0, "width": 0.5, "height": 2.0, "orientation": "vertical" },
    { "id": "D_G11", "name": "Door G11", "room_id": "G11", "corridor_id": "C4A", "x": 27.0, "y": 26.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G12", "name": "Door G12", "room_id": "G12", "corridor_id": "C4B", "x": 71.0, "y": 26.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G13", "name": "Door G13", "room_id": "G13", "corridor_id": "C4A", "x": 48.8, "y": 23.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G14", "name": "Door G14", "room_id": "G14", "corridor_id": "C2B", "x": 17.5, "y": 42.0, "width": 0.5, "height": 2.0, "orientation": "vertical" },
    { "id": "D_G15", "name": "Door D_G15", "room_id": "G15", "corridor_id": "C2B", "x": 17.5, "y": 31.0, "width": 0.5, "height": 2.0, "orientation": "vertical" },
    { "id": "D_G16", "name": "Door G16", "room_id": "G16", "corridor_id": "C2C", "x": 17.5, "y": 61.0, "width": 0.5, "height": 2.0, "orientation": "vertical" },
    { "id": "D_G17", "name": "Door G17", "room_id": "G17", "corridor_id": "C2C", "x": 17.5, "y": 54.0, "width": 0.5, "height": 2.0, "orientation": "vertical" },
    { "id": "D_G18", "name": "Door G18", "room_id": "G18", "corridor_id": "C5A", "x": 25.0, "y": 48.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G18A", "name": "Door G18A", "room_id": "G18A", "corridor_id": "C5A", "x": 33.5, "y": 48.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G19", "name": "Door G19", "room_id": "G19", "corridor_id": "C6B", "x": 75.8, "y": 69.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G19A", "name": "Door G19A", "room_id": "G19A", "corridor_id": "C6B", "x": 84.0, "y": 69.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G20", "name": "Door G20", "room_id": "G20", "corridor_id": "C5B", "x": 89.0, "y": 48.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G21", "name": "Door G21", "room_id": "G21", "corridor_id": "C4B", "x": 80.5, "y": 26.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G22", "name": "Door G22", "room_id": "G22", "corridor_id": "C4A", "x": 38.5, "y": 26.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G23", "name": "Door G23", "room_id": "G23", "corridor_id": "C4A", "x": 47.2, "y": 26.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G24", "name": "Door G24", "room_id": "G24", "corridor_id": "C4B", "x": 87.0, "y": 26.5, "width": 2.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_G26", "name": "Door G26", "room_id": "G26", "corridor_id": "C6B", "x": 94.0, "y": 69.5, "width": 1.0, "height": 0.5, "orientation": "horizontal" },
    { "id": "D_MISC", "name": "Door MISC", "room_id": "MISC", "corridor_id": "C6B", "x": 90.0, "y": 69.5, "width": 1.0, "height": 0.5, "orientation": "horizontal" }
  ],
  "waypoints": [
    { "id": "J_NW", "x": 19.5, "y": 25.5, "label": "North West Junction" },
    { "id": "J_NC", "x": 60.0, "y": 25.5, "label": "North Core Junction" },
    { "id": "J_NE", "x": 98.5, "y": 25.5, "label": "North East Junction" },
    { "id": "J_MW", "x": 19.5, "y": 46.5, "label": "Mid West Junction" },
    { "id": "J_MC", "x": 60.0, "y": 46.5, "label": "Mid Core Junction" },
    { "id": "J_ME", "x": 98.5, "y": 46.5, "label": "Mid East Junction" },
    { "id": "J_SW", "x": 19.5, "y": 68.5, "label": "South West Junction" },
    { "id": "J_SC", "x": 60.0, "y": 68.5, "label": "South Core Junction" },
    { "id": "J_SE", "x": 98.5, "y": 68.5, "label": "South East Junction" },
    { "id": "WP_C4_W", "x": 40.0, "y": 25.5, "label": "North Corridor West Mid" },
    { "id": "WP_C4_E", "x": 80.0, "y": 25.5, "label": "North Corridor East Mid" },
    { "id": "WP_C5_W", "x": 40.0, "y": 46.5, "label": "Central Corridor West Mid" },
    { "id": "WP_C5_E", "x": 80.0, "y": 46.5, "label": "Central Corridor East Mid" },
    { "id": "WP_C6_W", "x": 40.0, "y": 68.5, "label": "South Corridor West Mid" },
    { "id": "WP_C6_E", "x": 80.0, "y": 68.5, "label": "South Corridor East Mid" },
    { "id": "WP_S1", "x": 23.0, "y": 12.0, "label": "North West Stair" },
    { "id": "WP_S2", "x": 95.0, "y": 12.0, "label": "North East Stair" },
    { "id": "WP_S3", "x": 60.0, "y": 90.0, "label": "South Stair" },
    { "id": "WP_L1", "x": 60.0, "y": 39.0, "label": "Central Lift Lobby" },
    { "id": "WP_E3", "x": 109.0, "y": 59.0, "label": "East Side Exit Lobby" },
    { "id": "WP_G01", "x": 22.0, "y": 68.5, "label": "Door G01" },
    { "id": "WP_G02", "x": 31.5, "y": 68.5, "label": "Door G02" },
    { "id": "WP_G03", "x": 42.0, "y": 68.5, "label": "Door G03" },
    { "id": "WP_G04", "x": 51.5, "y": 68.5, "label": "Door G04" },
    { "id": "WP_G05", "x": 67.0, "y": 68.5, "label": "Door G05" },
    { "id": "WP_G06", "x": 72.5, "y": 46.5, "label": "Door G06" },
    { "id": "WP_G07", "x": 49.0, "y": 46.5, "label": "Door G07" },
    { "id": "WP_G08", "x": 66.0, "y": 46.5, "label": "Door G08" },
    { "id": "WP_G09", "x": 98.5, "y": 31.0, "label": "Door G09" },
    { "id": "WP_G10", "x": 98.5, "y": 42.0, "label": "Door G10" },
    { "id": "WP_G11", "x": 28.0, "y": 25.5, "label": "Door G11" },
    { "id": "WP_G12", "x": 72.0, "y": 25.5, "label": "Door G12" },
    { "id": "WP_G13", "x": 49.8, "y": 25.5, "label": "Door G13" },
    { "id": "WP_G14", "x": 19.5, "y": 43.0, "label": "Door G14" },
    { "id": "WP_G15", "x": 19.5, "y": 32.0, "label": "Door G15" },
    { "id": "WP_G16", "x": 19.5, "y": 62.0, "label": "Door G16" },
    { "id": "WP_G17", "x": 19.5, "y": 55.0, "label": "Door G17" },
    { "id": "WP_G18", "x": 26.0, "y": 46.5, "label": "Door G18" },
    { "id": "WP_G18A", "x": 34.5, "y": 46.5, "label": "Door G18A" },
    { "id": "WP_G19", "x": 76.8, "y": 68.5, "label": "Door G19" },
    { "id": "WP_G19A", "x": 85.0, "y": 68.5, "label": "Door G19A" },
    { "id": "WP_G20", "x": 90.0, "y": 46.5, "label": "Door G20" },
    { "id": "WP_G21", "x": 81.5, "y": 25.5, "label": "Door G21" },
    { "id": "WP_G22", "x": 39.5, "y": 25.5, "label": "Door G22" },
    { "id": "WP_G23", "x": 48.2, "y": 25.5, "label": "Door G23" },
    { "id": "WP_G24", "x": 88.0, "y": 25.5, "label": "Door G24" },
    { "id": "WP_G26", "x": 92.0, "y": 68.5, "label": "Door G26" },
    { "id": "WP_MISC", "x": 89.5, "y": 68.5, "label": "Door MISC" },
    { "id": "WP_C3C_South", "x": 98.5, "y": 67.0, "label": "C3C South Entry" }
  ],
  // Valid, physically continuous corridor edges strictly connecting adjacent consecutive nodes along corridor lines
  "graph_edges": [
    // 1. North Corridor West (y = 25.5)
    ["J_NW", "WP_G11", 8.5],
    ["WP_G11", "WP_G22", 11.5],
    ["WP_G22", "WP_C4_W", 0.5],
    ["WP_C4_W", "WP_G23", 8.2],
    ["WP_G23", "WP_G13", 1.6],
    ["WP_G13", "J_NC", 10.2],

    // 2. North Corridor East (y = 25.5)
    ["J_NC", "WP_G12", 12.0],
    ["WP_G12", "WP_C4_E", 8.0],
    ["WP_C4_E", "WP_G21", 1.5],
    ["WP_G21", "WP_G24", 6.5],
    ["WP_G24", "J_NE", 10.5],

    // 3. Central Corridor West (y = 46.5)
    ["J_MW", "WP_G18", 6.5],
    ["WP_G18", "WP_G18A", 8.5],
    ["WP_G18A", "WP_C5_W", 5.5],
    ["WP_C5_W", "WP_G07", 9.0],
    ["WP_G07", "J_MC", 11.0],

    // 4. Central Corridor East (y = 46.5)
    ["J_MC", "WP_G08", 6.0],
    ["WP_G08", "WP_G06", 6.5],
    ["WP_G06", "WP_C5_E", 7.5],
    ["WP_C5_E", "WP_G20", 10.0],
    ["WP_G20", "J_ME", 8.5],

    // 5. South Corridor West (y = 68.5)
    ["J_SW", "WP_G01", 2.5],
    ["WP_G01", "WP_G02", 9.5],
    ["WP_G02", "WP_C6_W", 8.5],
    ["WP_C6_W", "WP_G03", 2.0],
    ["WP_G03", "WP_G04", 9.5],
    ["WP_G04", "J_SC", 8.5],

    // 6. South Corridor East (y = 68.5)
    ["J_SC", "WP_G05", 7.0],
    ["WP_G05", "WP_G19", 9.8],
    ["WP_G19", "WP_C6_E", 3.2],
    ["WP_C6_E", "WP_G19A", 5.0],
    ["WP_G19A", "WP_MISC", 4.5],
    ["WP_MISC", "WP_G26", 2.5],
    ["WP_G26", "J_SE", 6.5],

    // 7. Left Wing Vertical Corridor (x = 19.5)
    ["J_NW", "WP_G15", 6.5],
    ["WP_G15", "WP_G14", 11.0],
    ["WP_G14", "J_MW", 3.5],
    ["J_MW", "WP_G17", 8.5],
    ["WP_G17", "WP_G16", 7.0],
    ["WP_G16", "J_SW", 6.5],

    // 8. Central Vertical Core (x = 60.0)
    ["J_NC", "WP_L1", 13.5],
    ["WP_L1", "J_MC", 7.5],
    ["J_MC", "J_SC", 22.0],

    // 9. Right Wing Vertical Corridor (x = 98.5)
    ["J_NE", "WP_G09", 5.5],
    ["WP_G09", "WP_G10", 11.0],
    ["WP_G10", "J_ME", 4.5],
    ["J_ME", "WP_C3C_South", 20.5],
    ["WP_C3C_South", "J_SE", 1.5],

    // 10. Vertical Egress, Stairs, Lifts and Exits
    ["J_NW", "WP_S1", 13.9],
    ["WP_S1", "E1", 5.4],
    ["J_NE", "WP_S2", 13.9],
    ["WP_S2", "E2", 2.2],
    ["J_SC", "WP_S3", 21.5],
    ["WP_S3", "E4", 2.8],
    ["J_ME", "WP_E3", 16.3],
    ["WP_C3C_South", "WP_E3", 13.2],
    ["WP_E3", "E3", 2.2],
    ["WP_L1", "L1", 6.0]
  ],
  "sensor_map": {
    "sensor_0": "C1A",
    "sensor_1": "C1B",
    "sensor_2": "C1C",
    "sensor_3": "C1D",
    "sensor_4": "C2A",
    "sensor_5": "C2B",
    "sensor_6": "C2C",
    "sensor_7": "C2D",
    "sensor_8": "C3A",
    "sensor_9": "C3B",
    "sensor_10": "C3C",
    "sensor_11": "C3D",
    "sensor_12": "C4A",
    "sensor_13": "C4B",
    "sensor_14": "C5A",
    "sensor_15": "C5B",
    "sensor_16": "C6A",
    "sensor_17": "C6B",
    "sensor_18": "CJ_NW",
    "sensor_19": "CJ_NC",
    "sensor_20": "CJ_NE",
    "sensor_21": "CJ_MW",
    "sensor_22": "CJ_MC",
    "sensor_23": "CJ_ME",
    "sensor_24": "CJ_SW",
    "sensor_25": "CJ_SC",
    "sensor_26": "CJ_SE",
    "sensor_27": "C7A",
    "sensor_28": "C7B",
    "sensor_29": "C7C"
  },
  "connections": {
    "room_to_corridor": [
      { "room_id": "G01", "corridor_id": "C6A", "door_id": "D_G01", "waypoint_id": "WP_G01" },
      { "room_id": "G02", "corridor_id": "C6A", "door_id": "D_G02", "waypoint_id": "WP_G02" },
      { "room_id": "G03", "corridor_id": "C6A", "door_id": "D_G03", "waypoint_id": "WP_G03" },
      { "room_id": "G04", "corridor_id": "C6A", "door_id": "D_G04", "waypoint_id": "WP_G04" },
      { "room_id": "G05", "corridor_id": "C6B", "door_id": "D_G05", "waypoint_id": "WP_G05" },
      { "room_id": "G06", "corridor_id": "C5B", "door_id": "D_G06", "waypoint_id": "WP_G06" },
      { "room_id": "G07", "corridor_id": "C5A", "door_id": "D_G07", "waypoint_id": "WP_G07" },
      { "room_id": "G08", "corridor_id": "C5B", "door_id": "D_G08", "waypoint_id": "WP_G08" },
      { "room_id": "G09", "corridor_id": "C3B", "door_id": "D_G09", "waypoint_id": "WP_G09" },
      { "room_id": "G10", "corridor_id": "C3B", "door_id": "D_G10", "waypoint_id": "WP_G10" },
      { "room_id": "G11", "corridor_id": "C4A", "door_id": "D_G11", "waypoint_id": "WP_G11" },
      { "room_id": "G12", "corridor_id": "C4B", "door_id": "D_G12", "waypoint_id": "WP_G12" },
      { "room_id": "G13", "corridor_id": "C4A", "door_id": "D_G13", "waypoint_id": "WP_G13" },
      { "room_id": "G14", "corridor_id": "C2B", "door_id": "D_G14", "waypoint_id": "WP_G14" },
      { "room_id": "G15", "corridor_id": "C2B", "door_id": "D_G15", "waypoint_id": "WP_G15" },
      { "room_id": "G16", "corridor_id": "C2C", "door_id": "D_G16", "waypoint_id": "WP_G16" },
      { "room_id": "G17", "corridor_id": "C2C", "door_id": "D_G17", "waypoint_id": "WP_G17" },
      { "room_id": "G18", "corridor_id": "C5A", "door_id": "D_G18", "waypoint_id": "WP_G18" },
      { "room_id": "G18A", "corridor_id": "C5A", "door_id": "D_G18A", "waypoint_id": "WP_G18A" },
      { "room_id": "G19", "corridor_id": "C6B", "door_id": "D_G19", "waypoint_id": "WP_G19" },
      { "room_id": "G19A", "corridor_id": "C6B", "door_id": "D_G19A", "waypoint_id": "WP_G19A" },
      { "room_id": "G20", "corridor_id": "C5B", "door_id": "D_G20", "waypoint_id": "WP_G20" },
      { "room_id": "G21", "corridor_id": "C4B", "door_id": "D_G21", "waypoint_id": "WP_G21" },
      { "room_id": "G22", "corridor_id": "C4A", "door_id": "D_G22", "waypoint_id": "WP_G22" },
      { "room_id": "G23", "corridor_id": "C4A", "door_id": "D_G23", "waypoint_id": "WP_G23" },
      { "room_id": "G24", "corridor_id": "C4B", "door_id": "D_G24", "waypoint_id": "WP_G24" },
      { "room_id": "G26", "corridor_id": "C6B", "door_id": "D_G26", "waypoint_id": "WP_G26" },
      { "room_id": "MISC", "corridor_id": "C6B", "door_id": "D_MISC", "waypoint_id": "WP_MISC" }
    ],
    "corridor_to_corridor": [
      { "from": "C2A", "to": "CJ_NW", "waypoint_id": "J_NW" },
      { "from": "C2B", "to": "CJ_NW", "waypoint_id": "J_NW" },
      { "from": "CJ_NW", "to": "C4A", "waypoint_id": "J_NW" },
      { "from": "CJ_NW", "to": "C7A", "waypoint_id": "J_NW" },
      { "from": "C1A", "to": "CJ_NC", "waypoint_id": "J_NC" },
      { "from": "C1B", "to": "CJ_NC", "waypoint_id": "J_NC" },
      { "from": "CJ_NC", "to": "C4A", "waypoint_id": "J_NC" },
      { "from": "CJ_NC", "to": "C4B", "waypoint_id": "J_NC" },
      { "from": "C3A", "to": "CJ_NE", "waypoint_id": "J_NE" },
      { "from": "C3B", "to": "CJ_NE", "waypoint_id": "J_NE" },
      { "from": "CJ_NE", "to": "C4B", "waypoint_id": "J_NE" },
      { "from": "CJ_NE", "to": "C7B", "waypoint_id": "J_NE" },
      { "from": "C2B", "to": "CJ_MW", "waypoint_id": "J_MW" },
      { "from": "C2C", "to": "CJ_MW", "waypoint_id": "J_MW" },
      { "from": "CJ_MW", "to": "C5A", "waypoint_id": "J_MW" },
      { "from": "C1B", "to": "CJ_MC", "waypoint_id": "J_MC" },
      { "from": "C1C", "to": "CJ_MC", "waypoint_id": "J_MC" },
      { "from": "CJ_MC", "to": "C5A", "waypoint_id": "J_MC" },
      { "from": "CJ_MC", "to": "C5B", "waypoint_id": "J_MC" },
      { "from": "C3B", "to": "CJ_ME", "waypoint_id": "J_ME" },
      { "from": "C3C", "to": "CJ_ME", "waypoint_id": "J_ME" },
      { "from": "CJ_ME", "to": "C5B", "waypoint_id": "J_ME" },
      { "from": "CJ_ME", "to": "C7C", "waypoint_id": "J_ME" },
      { "from": "C2C", "to": "CJ_SW", "waypoint_id": "J_SW" },
      { "from": "C2D", "to": "CJ_SW", "waypoint_id": "J_SW" },
      { "from": "CJ_SW", "to": "C6A", "waypoint_id": "J_SW" },
      { "from": "C1C", "to": "CJ_SC", "waypoint_id": "J_SC" },
      { "from": "C1D", "to": "CJ_SC", "waypoint_id": "J_SC" },
      { "from": "CJ_SC", "to": "C6A", "waypoint_id": "J_SC" },
      { "from": "CJ_SC", "to": "C6B", "waypoint_id": "J_SC" },
      { "from": "C3C", "to": "CJ_SE", "waypoint_id": "J_SE" },
      { "from": "C3D", "to": "CJ_SE", "waypoint_id": "J_SE" },
      { "from": "CJ_SE", "to": "C6B", "waypoint_id": "J_SE" }
    ],
    "corridor_to_vertical_egress": [
      { "corridor_id": "C7A", "stair_id": "S1", "waypoint_id": "WP_S1" },
      { "corridor_id": "C7B", "stair_id": "S2", "waypoint_id": "WP_S2" },
      { "corridor_id": "C1D", "stair_id": "S3", "waypoint_id": "WP_S3" },
      { "corridor_id": "C7C", "stair_id": "E3", "waypoint_id": "WP_E3" },
      { "corridor_id": "C1B", "lift_id": "L1", "waypoint_id": "WP_L1" }
    ],
    "stairs_to_exits": [
      { "stair_id": "S1", "exit_id": "E1" },
      { "stair_id": "S2", "exit_id": "E2" },
      { "stair_id": "S3", "exit_id": "E4" }
    ]
  }
};

const seedDatabase = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/indoornav';
    await mongoose.connect(connString);
    console.log('Connected to MongoDB for SJT Ground Floor Seeding...');

    // 1. Clear existing database collections
    await User.deleteMany({});
    await Building.deleteMany({});
    await Floor.deleteMany({});
    await Room.deleteMany({});
    await Landmark.deleteMany({});
    await Route.deleteMany({});
    await Feedback.deleteMany({});
    await Connection.deleteMany({});
    await Corridor.deleteMany({});
    await Stair.deleteMany({});
    await Lift.deleteMany({});
    await Exit.deleteMany({});
    await Door.deleteMany({});
    await Waypoint.deleteMany({});
    await LogicalConnection.deleteMany({});
    await SensorMap.deleteMany({});
    await Hazard.deleteMany({});
    console.log('Cleared existing collections.');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedStudentPassword = await bcrypt.hash('123456', salt);
    const hashedAdminPassword = await bcrypt.hash('123456', salt);

    const users = await User.insertMany([
      {
        name: 'Mohammed Rayaan N',
        email: 'student@campus.edu',
        password: hashedStudentPassword,
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@indoornav.com',
        password: hashedAdminPassword,
        role: 'admin'
      }
    ]);
    console.log(`Seeded ${users.length} user accounts.`);

    // 3. Seed Building (SJT Ground Floor)
    const buildingData = {
      name: mapDataset.building.name,
      code: 'sjt-ground',
      description: 'SJT Ground Floor - Metric Layout with classrooms, labs, toilets, stairs, elevators and corridors.',
      numberOfFloors: 1,
      numberOfLocations: mapDataset.rooms.length,
      facilities: ['Smartboards', 'A/C Classrooms', 'Elevators', 'Emergency Exits'],
      width: mapDataset.building.width,
      height: mapDataset.building.height,
      coordinateSystem: mapDataset.building.coordinate_system,
      units: mapDataset.building.units,
      metersPerUnit: mapDataset.building.meters_per_unit,
      displayScale: mapDataset.building.display_scale,
      pixelsPerMeter: mapDataset.building.pixels_per_meter,
      isActive: true
    };

    const building = await Building.create(buildingData);
    console.log(`Seeded Building Block: ${building.name}`);

    // 4. Seed Floor
    const floor = await Floor.create({
      buildingId: building._id,
      name: 'Ground Floor',
      floorNumber: 0,
      floorCode: 'sjt-0',
      description: 'Ground floor layout of SJT',
      isActive: true
    });
    console.log(`Seeded Floor Level: ${floor.name}`);

    // 5. Seed Rooms
    const getRoomType = (name) => {
      const lower = name.toLowerCase();
      if (lower.includes('toilet') || lower.includes('washroom')) return 'Restroom';
      if (lower.includes('lab')) return 'Laboratory';
      if (lower.includes('classroom')) return 'Classroom';
      if (lower.includes('dining') || lower.includes('canteen')) return 'Cafeteria';
      if (lower.includes('office') || lower.includes('cabin') || lower.includes('dean')) return 'Office';
      if (lower.includes('stair')) return 'Staircase';
      if (lower.includes('exit')) return 'Exit';
      if (lower.includes('lift') || lower.includes('elevator')) return 'Elevator';
      if (lower.includes('room') || lower.includes('store')) return 'Facility';
      return 'Other';
    };

    const roomsToInsert = mapDataset.rooms.map(r => ({
      buildingId: building._id,
      floorId: floor._id,
      roomNumber: r.id,
      name: r.name,
      roomType: getRoomType(r.name),
      department: r.department || '',
      description: `${r.name} in SITE Department`,
      capacity: r.capacity.toString(),
      width: r.width,
      height: r.height,
      areaSqft: r.area_sqft,
      areaSqm: r.area_sqm,
      coordinates: { x: r.x, y: r.y },
      facilities: r.capacity > 10 ? ['AC', 'Projector', 'Wi-Fi'] : ['Wi-Fi'],
      isAccessible: true,
      isActive: true
    }));

    const seededRooms = await Room.insertMany(roomsToInsert);
    console.log(`Seeded ${seededRooms.length} Rooms.`);

    // 6. Seed Corridors
    const corridorsToInsert = mapDataset.corridors.map(c => ({
      buildingId: building._id,
      floorId: floor._id,
      corridorId: c.id,
      name: c.name,
      x: c.x,
      y: c.y,
      width: c.width,
      height: c.height
    }));
    const seededCorridors = await Corridor.insertMany(corridorsToInsert);
    console.log(`Seeded ${seededCorridors.length} Corridors.`);

    // 7. Seed Stairs
    const stairsToInsert = mapDataset.stairs.map(s => ({
      buildingId: building._id,
      floorId: floor._id,
      stairId: s.id,
      name: s.name,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height
    }));
    const seededStairs = await Stair.insertMany(stairsToInsert);
    console.log(`Seeded ${seededStairs.length} Staircases.`);

    // 8. Seed Lifts
    const liftsToInsert = mapDataset.lifts.map(l => ({
      buildingId: building._id,
      floorId: floor._id,
      liftId: l.id,
      name: l.name,
      x: l.x,
      y: l.y,
      width: l.width,
      height: l.height
    }));
    const seededLifts = await Lift.insertMany(liftsToInsert);
    console.log(`Seeded ${seededLifts.length} Lifts.`);

    // 9. Seed Exits
    const exitsToInsert = mapDataset.exits.map(e => ({
      buildingId: building._id,
      floorId: floor._id,
      exitId: e.id,
      name: e.name,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height
    }));
    const seededExits = await Exit.insertMany(exitsToInsert);
    console.log(`Seeded ${seededExits.length} Exits.`);

    // 10. Seed Doors
    const doorsToInsert = mapDataset.doors.map(d => ({
      buildingId: building._id,
      floorId: floor._id,
      doorId: d.id,
      name: d.name,
      roomId: d.room_id,
      corridorId: d.corridor_id,
      x: d.x,
      y: d.y,
      width: d.width,
      height: d.height,
      orientation: d.orientation
    }));
    const seededDoors = await Door.insertMany(doorsToInsert);
    console.log(`Seeded ${seededDoors.length} Doors.`);

    // 11. Seed Waypoints
    const waypointsToInsert = mapDataset.waypoints.map(w => ({
      buildingId: building._id,
      floorId: floor._id,
      waypointId: w.id,
      x: w.x,
      y: w.y,
      label: w.label || ''
    }));
    const seededWaypoints = await Waypoint.insertMany(waypointsToInsert);
    console.log(`Seeded ${seededWaypoints.length} Waypoints.`);

    // 12. Seed Logical Connections
    const logicalConnsToInsert = [];
    
    // room_to_corridor
    mapDataset.connections.room_to_corridor.forEach(conn => {
      logicalConnsToInsert.push({
        buildingId: building._id,
        floorId: floor._id,
        type: 'room_to_corridor',
        fromId: conn.room_id,
        toId: conn.corridor_id,
        doorId: conn.door_id,
        waypointId: conn.waypoint_id
      });
    });

    // corridor_to_corridor
    mapDataset.connections.corridor_to_corridor.forEach(conn => {
      logicalConnsToInsert.push({
        buildingId: building._id,
        floorId: floor._id,
        type: 'corridor_to_corridor',
        fromId: conn.from,
        toId: conn.to,
        waypointId: conn.waypoint_id
      });
    });

    // corridor_to_vertical_egress
    mapDataset.connections.corridor_to_vertical_egress.forEach(conn => {
      logicalConnsToInsert.push({
        buildingId: building._id,
        floorId: floor._id,
        type: 'corridor_to_vertical_egress',
        fromId: conn.corridor_id,
        toId: conn.stair_id || conn.exit_id || conn.lift_id,
        waypointId: conn.waypoint_id
      });
    });

    // stairs_to_exits
    mapDataset.connections.stairs_to_exits.forEach(conn => {
      logicalConnsToInsert.push({
        buildingId: building._id,
        floorId: floor._id,
        type: 'stairs_to_exits',
        fromId: conn.stair_id,
        toId: conn.exit_id
      });
    });

    const seededLogical = await LogicalConnection.insertMany(logicalConnsToInsert);
    console.log(`Seeded ${seededLogical.length} Logical Connections.`);

    // 13. Seed Sensor Map
    const sensorsToInsert = Object.entries(mapDataset.sensor_map).map(([sensorId, elementId]) => ({
      buildingId: building._id,
      floorId: floor._id,
      sensorId,
      elementId
    }));
    const seededSensors = await SensorMap.insertMany(sensorsToInsert);
    console.log(`Seeded ${seededSensors.length} Sensor Mappings.`);

    // 14. Compile and Seed Connection (Graph Edges)
    const connectionsToInsert = [];
    const waypointsMap = {};
    mapDataset.waypoints.forEach(w => {
      waypointsMap[w.id] = { x: w.x, y: w.y };
    });

    // Also include exits and lifts in waypoints coordinates for edges
    mapDataset.exits.forEach(e => {
      waypointsMap[e.id] = { x: e.x, y: e.y };
    });
    mapDataset.lifts.forEach(l => {
      waypointsMap[l.id] = { x: l.x, y: l.y };
    });

    // Determine type and accessibility of edge endpoints
    const getEdgeType = (fromNode, toNode) => {
      const f = fromNode.toLowerCase();
      const t = toNode.toLowerCase();
      
      // Stair connection
      if (f.startsWith('wp_s1') || f.startsWith('wp_s2') || f.startsWith('wp_s3') || 
          t.startsWith('wp_s1') || t.startsWith('wp_s2') || t.startsWith('wp_s3')) {
        return { type: 'stairs', accessibility: false };
      }
      // Elevator connection
      if (f.startsWith('l1') || f.startsWith('wp_l') || t.startsWith('l1') || t.startsWith('wp_l')) {
        return { type: 'elevator', accessibility: true };
      }
      // Door connection
      if (f.startsWith('wp_g') || t.startsWith('wp_g') || f.startsWith('wp_misc') || t.startsWith('wp_misc')) {
        return { type: 'door', accessibility: true };
      }
      return { type: 'corridor', accessibility: true };
    };

    mapDataset.graph_edges.forEach(([fromNode, toNode, distance]) => {
      const { type, accessibility } = getEdgeType(fromNode, toNode);
      const fromCoords = waypointsMap[fromNode] || { x: 0, y: 0 };
      const toCoords = waypointsMap[toNode] || { x: 0, y: 0 };

      // Calculate exact Euclidean distance if not supplied
      const calcDist = distance !== undefined && distance > 0 
        ? distance 
        : Math.round(Math.hypot(toCoords.x - fromCoords.x, toCoords.y - fromCoords.y) * 10) / 10;

      connectionsToInsert.push({
        fromNode,
        toNode,
        distance: calcDist,
        type,
        accessibility,
        floor: 0,
        isActive: true,
        pathPoints: [fromCoords, toCoords]
      });
    });

    const seededConnections = await Connection.insertMany(connectionsToInsert);
    console.log(`Seeded ${seededConnections.length} Active Graph Edge Connections.`);

    // 15. Create demo feedback items
    const demoFeedbacks = [
      {
        issueType: 'Incorrect room',
        message: 'Classroom G01 is site-labeled SITE lab in some listings.',
        status: 'Pending'
      },
      {
        issueType: 'Blocked path',
        message: 'Staircase S1 North West is scheduled for wiring upgrades.',
        status: 'Pending'
      }
    ];
    await Feedback.insertMany(demoFeedbacks);
    console.log('Seeded feedback records.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
