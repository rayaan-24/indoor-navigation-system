/**
 * Help & FAQ Page Content
 * 
 * Add, edit, or reorganize frequently asked questions and quick guide steps here.
 */

export const helpContent = {
  header: {
    title: 'Help Center & FAQ',
    subtitle: 'Get quick answers to common indoor wayfinding questions or learn how to browse maps.'
  },
  quickGuide: {
    title: 'Quick Wayfinding Guide',
    steps: [
      {
        step: '1',
        title: 'Locate Buildings',
        description: 'Browse the Buildings menu, pick your target academic block, and view the floor list map to inspect room locations.'
      },
      {
        step: '2',
        title: 'Plot Navigation',
        description: 'Enter your starting point (e.g. Lobby Entrance) and target room, then press "Find Route" to calculate the waypoints path.'
      },
      {
        step: '3',
        title: 'Switch Floor Views',
        description: 'If navigation goes upstairs, use the floor selector tabs to see layout adjustments of subsequent floors.'
      }
    ]
  },
  faqs: {
    title: 'Frequently Asked Questions',
    items: [
      {
        question: 'How do I find a classroom or office room?',
        answer: 'You can search for rooms using the autocomplete search bar on the Home page or by navigating to the Locations directory. In the directory, you can also filter by building, floor, or categories (like Classroom, Lab, Department Office).'
      },
      {
        question: 'Can I navigate between different floors?',
        answer: 'Yes! IndoorNav fully supports multi-floor routing. When a route traverses levels, the directions panel will list floor changes (e.g. "Take Staircase B1 up to Floor 2"). You can click the floor tabs above the map to see the layout of each floor level along the route.'
      },
      {
        question: 'How do turn-by-turn directions work?',
        answer: 'IndoorNav calculates the shortest walking path through corridors, connectors, and doorways, providing step-by-step guidance straight to your target room or facility.'
      },
      {
        question: 'What if a route or room is blocked or closed?',
        answer: 'You can report blocked corridors, incorrect room numbers, or missing locations by visiting our "Feedback/Report Issue" page from the footer. The administrator review team will review and update the maps in real time.'
      },
      {
        question: 'Can I save frequently visited locations?',
        answer: 'Yes. On any room detail page, you can click the "Heart" favorite icon. This will bookmark the room to your Favorites shelf, which you can easily access on your User Profile page.'
      },
      {
        question: 'How do I report an incorrect location or map error?',
        answer: 'Navigate to the Feedback page, choose the type of issue (e.g. "Incorrect room", "Blocked path"), describe the discrepancy, and click submit. Our administration portal compiles these issues for immediate map grid adjustments.'
      }
    ]
  }
};

export default helpContent;
