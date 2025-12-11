# **App Name**: Nutrition Navigator

## Core Features:

- User Onboarding: Collects user data (name, age, height, weight, health questions) on first visit and stores it in localStorage.
- Food Doctor: Generates personalized food recommendations, foods to avoid, affordable suggestions, and a meal plan using the Gemini API and the user's profile data as a tool.
- Calorie Tracker: Estimates calorie count of user-entered food using Gemini API, and stores data in localStorage along with date.
- Data Persistence: Stores data such as food suggestions and calorie logs in local storage, ensuring data persists between sessions.
- Analytics Dashboard: Presents total calorie intake per day, week, and month using data from localStorage. Uses Chart.js for visual representation.
- Home Screen: The app entrypoint, which presents two buttons: Food Doctor and Calorie Tracker.

## Style Guidelines:

- Primary color: Vibrant green (#67B367) to convey health and vitality.
- Background color: Very light green (#E5F5E5), close in hue to the primary color, to promote readability.
- Accent color: A subtly different, slightly blueish green (#5BA367) for interactive elements like buttons and links.
- Font: 'PT Sans', a humanist sans-serif for headlines and body text that offers both a modern look and a little warmth.
- Mobile-first, responsive layout for optimal viewing on various devices.
- Simple, clean icons representing different food groups and health metrics.
- Smooth transitions and subtle animations to enhance user experience.