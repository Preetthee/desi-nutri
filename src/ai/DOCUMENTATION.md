# Nutrition Navigator: Application Documentation

## 1. Overview

**Nutrition Navigator** is a web-based health and wellness application designed to provide users with personalized nutrition advice and tracking capabilities. Built with Next.js and powered by Google's Gemini AI through the Genkit framework, the app serves as a personal nutrition assistant. It collects user-specific health data to offer tailored food recommendations, calorie tracking, exercise suggestions, and more. All user data is stored locally in the browser, ensuring privacy and data persistence between sessions.

## 2. Core Features

The application is centered around a set of core features designed to guide users toward their health goals.

### 2.1. User Onboarding
-   **Functionality**: On their first visit, users are guided through an onboarding process where they provide essential information such as name, age, height, weight, and answers to specific health-related questions (e.g., goals, dietary restrictions).
-   **Data Storage**: This information is saved to the browser's `localStorage`, making it available for all other features of the app to provide a personalized experience.
-   **File Reference**: `src/app/onboarding/page.tsx`

### 2.2. Food Doctor
-   **Functionality**: This is the app's primary recommendation engine. It leverages the Gemini API to provide personalized food advice based on the user's profile. The suggestions include:
    -   Recommended foods that align with the user's health goals.
    -   Foods to avoid.
    -   Affordable and healthy meal options.
    -   A structured meal plan.
-   **AI Flows**:
    -   `food-suggestions-from-profile.ts`: Generates meal and food ideas.
    -   `check-food-appropriateness.ts`: Validates if a specific food is suitable for the user.
-   **File Reference**: `src/app/food-doctor/page.tsx`

### 2.3. Calorie Tracker
-   **Functionality**: Allows users to input the food they have consumed. The application then uses the Gemini API to estimate the total calorie count of that food.
-   **Data Storage**: Each calorie entry is logged with the current date and stored in `localStorage`. This historical data is used to power the analytics dashboard.
-   **AI Flow**: `estimate-calories-from-food-text.ts`
-   **File Reference**: `src/app/calorie-tracker/page.tsx`

### 2.4. Analytics Dashboard
-   **Functionality**: Provides users with a visual representation of their calorie intake over time. It aggregates data from the Calorie Tracker logs.
-   **Visualization**: Uses Chart.js to display data in daily, weekly, and monthly views, helping users track their progress and identify trends.
-   **File Reference**: `src/app/analytics/page.tsx`

### 2.5. Exercise and Health Tips
-   **Functionality**: The app proactively helps users by generating personalized health tips and exercise suggestions based on their profile.
-   **AI Flows**:
    -   `generate-exercise-suggestion.ts`: Creates a tailored exercise recommendation.
    -   `generate-health-tip.ts`: Generates a short, actionable health tip with an explanation of its benefits.
-   **File References**: `src/app/exercise/page.tsx`, `src/ai/flows/generate-health-tip.ts`

## 3. Technical Stack

-   **Framework**: **Next.js** (App Router)
-   **Language**: **TypeScript**
-   **AI Integration**:
    -   **Genkit**: An open-source framework from Google for building AI-powered applications. It is used to define, run, and manage the AI flows.
    -   **Google AI (Gemini)**: The underlying AI model used for all generative tasks is `gemini-2.5-flash`, configured in `src/ai/genkit.ts`.
-   **Styling**:
    -   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
    -   **shadcn/ui**: A collection of beautifully designed, reusable components built on top of Radix UI and Tailwind CSS. The component files are located in `src/components/ui/`.
-   **Data Persistence**: **`localStorage`** is used for all client-side data storage, including user profiles and calorie logs. The `use-local-storage.ts` hook provides a convenient wrapper for this.
-   **Internationalization (i18n)**: The app supports multiple languages (English and Bengali) through a simple i18n setup located in `src/lib/i18n/`. The `language-toggle.tsx` component allows users to switch languages.

## 4. Project Structure

The project follows a standard Next.js App Router structure with clear separation of concerns.

```
/
├── docs/                     # Project documentation (e.g., blueprint.md)
├── src/
│   ├── ai/                   # AI-related logic
│   │   ├── flows/            # All Genkit AI flows
│   │   └── genkit.ts         # Genkit configuration with Gemini model
│   ├── app/                  # Application routes/pages
│   │   ├── (pages)/          # Main pages (onboarding, food-doctor, etc.)
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home screen/entry point
│   ├── components/           # Reusable React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── app-sidebar.tsx   # Main application sidebar
│   ├── contexts/             # React contexts (e.g., LanguageProvider)
│   ├── hooks/                # Custom React hooks (e.g., useLocalStorage)
│   ├── lib/                  # Library/utility files
│   │   ├── i18n/             # Internationalization files
│   │   ├── types.ts          # TypeScript type definitions
│   │   └── utils.ts          # Utility functions
└── ... (config files)
```

## 5. Style Guidelines

The visual design of the app is intended to be clean, modern, and health-focused.

-   **Primary Color**: `Vibrant green (#67B367)` - Used to convey health and vitality.
-   **Background Color**: `Very light green (#E5F5E5)` - A complementary light shade to ensure readability.
-   **Accent Color**: `Blueish green (#5BA367)` - Used for interactive elements like buttons and links to make them stand out.
-   **Font**: **PT Sans** - A humanist sans-serif font used for both headlines and body text to provide a modern yet warm feel.
-   **Responsiveness**: The app employs a mobile-first, responsive layout to ensure an optimal viewing experience on all devices.
-   **User Experience**: The UI is enhanced with simple, clean icons and smooth, subtle animations to improve user interaction.
