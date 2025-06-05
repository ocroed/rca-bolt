# Application Description: RCA Bolt

This application serves as a comprehensive platform for managing Root Cause Analyses (RCAs). Its main features include a dynamic dashboard that provides an overview of RCAs, displaying statistics, status distributions, recently accessed RCAs, and their overall impact. Users can efficiently create new RCAs, view and manage active incidents or ongoing RCAs, and leverage robust filtering and sorting capabilities to organize incidents. The application is built using a modern technology stack, with a frontend developed in React and TypeScript, powered by Vite. Styling is implemented with Tailwind CSS, navigation is handled by `react-router-dom`, state management is managed by Zustand, and `lucide-react` is used for iconography.

## Application Structure

The application follows a standard project structure for React applications built with Vite. Key directories and files are organized as follows:

### Root Directory Files

*   `package.json`: Defines project metadata, dependencies, and scripts (e.g., for starting the development server, building the application).
*   `vite.config.ts`: Contains the configuration for Vite, the frontend build tool, specifying plugins and build options.
*   `tailwind.config.js`: Configures Tailwind CSS, including theme customizations, plugins, and content paths for style generation.
*   `tsconfig.json`: Specifies the root TypeScript configuration for the project, including compiler options and file inclusion/exclusion. Additional `tsconfig.*.json` files (like `tsconfig.app.json`, `tsconfig.node.json`) may provide more specific configurations.
*   `index.html`: The main HTML file located in the root directory (rather than a `public/` folder in this projects case). Vite uses this as the entry point to inject the bundled JavaScript and CSS.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore (e.g., `node_modules/`, build outputs, environment files).
*   `README.md`: Provides general information about the project.
*   `eslint.config.js`: Configuration for ESLint, the JavaScript/TypeScript linter.
*   `postcss.config.js`: Configuration for PostCSS, often used with Tailwind CSS for processing CSS.

### `src/` Directory

This directory is the heart of the application, containing all the source code.

*   `main.tsx`: The entry point for the React application. It typically imports the root `App` component and renders it into the DOM, often also setting up global contexts or providers.
*   `App.tsx`: The root React component. It usually defines the main layout structure (e.g., using `Layout` component) and sets up client-side routing using `react-router-dom`.
*   `index.css`: Contains global styles, Tailwind CSS base directives (`@tailwind base; @tailwind components; @tailwind utilities;`), and any custom global CSS rules.
*   `vite-env.d.ts`: TypeScript declaration file for Vite-specific environment variables.

#### `src/components/`

This directory houses reusable UI components that are used across different parts of the application.

*   `layout/`: Contains components that define the overall structure of the applications pages, such as:
    *   `Header.tsx`: The application header/navbar.
    *   `Sidebar.tsx`: The navigation sidebar.
    *   `Layout.tsx`: A component that combines header, sidebar, and content area to create a consistent page layout.
*   `dashboard/`: Components specifically designed for the dashboard page. Examples include:
    *   `DashboardStats.tsx`: Displays key statistics.
    *   `RecentRCAs.tsx`: Lists recent RCAs.
    *   `StatusDistribution.tsx`: Shows RCA status distribution chart.
    *   `DepartmentImpact.tsx`: Visualizes impact by department.
    *   `ImpactChart.tsx`: A generic chart component possibly used by other dashboard components.
*   `modals/`: Contains components for modal dialogs.
    *   `CreateRCAModal.tsx`: A modal for creating new RCA entries.

#### `src/pages/`

This directory contains top-level components that correspond to different application views or pages, typically rendered by the router.

*   `Dashboard.tsx`: The component for the main dashboard page.
*   `ActiveIncidents.tsx`: The component for the page displaying active incidents or RCAs.

#### `src/data/`

This directory is used for storing mock data, which is helpful during development before a backend API is fully integrated.

*   `mockData.ts`: Contains sample data structures and arrays for populating the UI.

#### `src/services/`

This directory is intended for modules related to external service integrations, particularly API communication.

*   `api/index.ts`: Likely serves as an entry point for API service definitions or client configurations (e.g., an Axios instance setup).

#### `src/store/`

This directory holds the logic for global state management.

*   `index.ts`: The main file for configuring and exporting the Zustand store(s).

#### `src/types/`

Contains TypeScript type definitions and interfaces used throughout the application.

*   `index.ts`: Often re-exports types from other files in this directory.
*   `models.ts`: Defines data structures and types representing the applications entities (e.g., RCA, Incident).

#### `src/utils/`

A collection of utility functions, constants, and other helper modules.

*   `constants.ts`: Defines application-wide constants.
*   `formatters.ts`: Contains functions for formatting data (e.g., dates, numbers).

### `public/` Directory (Usage Note)

While this project does not currently have a `public/` directory at the root, in many Vite (and other frontend) projects, a `public/` directory is used to serve static assets that do not need to be processed by the build pipeline (e.g., favicons, `robots.txt`, images that are directly referenced). Vite serves these assets from the root path (`/`). In this project, `index.html` is in the root, and other assets might be imported directly into JavaScript/TypeScript or referenced from `index.html`.

## Data Flow and State Management

This section outlines how data is managed and flows through the application.

### Current Data Source

Currently, the application primarily relies on mock data for its operations. This data is defined in `src/data/mockData.ts`. It includes sample data structures representing RCA (Root Cause Analysis) details, incident reports, user information, and other entities needed to simulate the applications functionalities. This approach allows for rapid UI development and testing without a backend dependency.

### Global State Management with Zustand

Zustand, a lightweight and flexible state management library, is utilized for managing global application state (as indicated by its inclusion in `package.json` and the presence of a dedicated store directory).

*   **Central Store:** The `src/store/index.ts` file is the central hub for defining the Zustand store(s). This is where global state slices, actions (functions to modify state), and selectors (functions to access state) are likely defined.
*   **Component Interaction:** React components can interact with the Zustand store to access shared data (e.g., user authentication status, application-wide settings, or cached master data) or to trigger global state changes. This is typically done by using hooks provided by Zustand to subscribe to state updates and dispatch actions.

### Data Fetching (Future Implementation)

The application is structured to incorporate backend data fetching in the future.

*   **API Services:** The `src/services/api/index.ts` file and its surrounding directory are designated for housing the logic for making API calls to a backend server. This layer will be responsible for fetching, sending, and updating data.
*   **Replacing Mock Data:** Once backend services are integrated, the data fetched via these API services will replace or augment the current mock data sources, providing real-time and persistent information.

### Local Component State

In addition to global state managed by Zustand, individual React components utilize their own local state for UI-specific concerns.

*   **React `useState`:** Components like `Dashboard.tsx` (for managing modal visibility) and `ActiveIncidents.tsx` (for handling local filter values or sorting criteria) use Reacts built-in `useState` hook. This is appropriate for state that doesnt need to be shared globally and is confined to the components own lifecycle and interactions.

### Data Flow Overview

The general data flow can be summarized as follows:

1.  **Data Sources:** Data originates from:
    *   The mock data file (`src/data/mockData.ts`) in the current setup.
    *   The global Zustand store (`src/store/index.ts`) for shared application state.
    *   User input and interactions within components (managed via local state or dispatched to the global store).
    *   (Future) Backend APIs, with data fetched through the modules in `src/services/`.
2.  **To Pages and Components:**
    *   Page-level components (in `src/pages/`) consume data from the Zustand store, local state, or directly from services/mock data.
    *   These page components then pass data down as props to more specific UI components (in `src/components/`) for display and interaction.
3.  **Updates:** Changes to data (e.g., creating a new RCA) would typically involve:
    *   Updating local component state for immediate UI feedback if necessary.
    *   Dispatching actions to the Zustand store to modify the global state.
    *   (Future) Calling API service functions to persist changes to the backend.

## User Interaction and Navigation

This section describes how users navigate and interact with the applications features.

### Overall Navigation

The application employs a consistent layout structure, provided by the `Layout` component (likely composed of `Header.tsx` and `Sidebar.tsx`), ensuring a familiar navigation experience across different pages.

*   **Main Navigation:** Users primarily navigate using links in the sidebar (or a header menu). Key navigation paths include:
    *   **Dashboard:** Accessible via `/dashboard`, serving as the main landing page.
    *   **Active Incidents:** Accessible via `/active-incidents`, for viewing ongoing RCAs.
*   **Default Route:** The application is configured so that accessing the root path (`/`) automatically redirects the user to the `/dashboard`.

### Dashboard Interaction (`/dashboard`)

The Dashboard page provides a high-level overview of RCA activities and metrics.

*   **Information Display:** Users can view various informational components:
    *   `DashboardStats`: Key performance indicators and summary statistics.
    *   `StatusDistribution`: A visual breakdown (e.g., chart) of RCAs by their current status.
    *   `RecentRCAs`: A list or feed of recently accessed or updated RCAs.
    *   `ImpactChart` and `DepartmentImpact`: Visualizations showing the impact of RCAs, potentially broken down by department or other criteria.
*   **RCA Creation:** A prominent "Create New RCA" button is available. Clicking this button opens the `CreateRCAModal` dialog, allowing users to input details for a new RCA.

### Active Incidents Page (`/active-incidents`)

This page focuses on displaying and managing a list of currently active or ongoing RCAs.

*   **Incident Monitoring:** Users can view a collection of active incidents, typically displayed as individual cards or list items, each summarizing key details of an RCA.
*   **Filtering:** Users can refine the list of incidents using filter controls, such as:
    *   Filtering by severity level.
    *   Filtering by location or department affected.
*   **Sorting:** Options to sort the incidents are available, allowing users to organize the list by:
    *   Date (e.g., creation date, last updated).
    *   Severity level.
    *   Financial impact or other key metrics.

### RCA Creation Process

The process for creating a new Root Cause Analysis is initiated from the Dashboard.

*   **Modal Form:** Upon clicking the "Create New RCA" button, the `CreateRCAModal` appears. This modal contains a form with fields for users to input various details pertaining to the new RCA, such as title, description, dates, involved teams, impact assessment, etc.
*   **Submission (TODO):** While the form allows data input, the actual logic for submitting this data (e.g., to a state management store or a backend API) is noted as a future development task (TODO).

### General UI Elements

Throughout the application, various UI elements enhance usability and interaction:

*   **Icons:** `lucide-react` icons are used to provide visual cues and improve the aesthetic appeal of buttons, navigation items, and informational displays.
*   **Interactive Controls:** Standard interactive elements like buttons (for actions like "Create New RCA"), dropdown menus (for selecting filter options or sorting criteria), and input fields (in forms like the RCA creation modal) are used extensively.
