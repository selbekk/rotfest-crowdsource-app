# Rotfest Bildegalleri

This application was originally created for Bekk's 25th-anniversary celebration, "Rotfest." Attendees could upload their photos from the event, which were then processed by an AI to add a touch of Norwegian national romanticism. The image upload functionality is now closed, and the application primarily serves as a gallery to view these unique, AI-enhanced images.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/kristofer-selbekks-projects/v0-rotfest-crowdsource-app)

## About The Project

The Rotfest Bildegalleri showcases images from Bekk's 25th-anniversary event. Users could initially upload photos, which were then artistically modified by an AI (leveraging OpenAI's DALL·E or similar services) to incorporate elements of Norwegian national romanticism. The app now features:

*   A dynamic image gallery to browse all submitted and processed photos.
*   Slideshow functionality with autoplay, manual navigation, and fullscreen mode.
*   Responsive design for viewing on various devices.

## Technologies Used

This project is built with a modern web stack:

*   **Frontend**:
    *   [Next.js](https://nextjs.org/) (React Framework)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Shadcn/UI](https://ui.shadcn.com/) (for UI components like buttons)
    *   [Framer Motion](https://www.framer.com/motion/) (for animations)
    *   [Lucide React](https://lucide.dev/) (for icons)
*   **Backend & AI Processing**:
    *   [Firebase Functions](https://firebase.google.com/docs/functions) (for serverless backend logic, e.g., image processing triggers)
    *   [OpenAI API](https://openai.com/api/) (likely DALL·E for image generation/modification)
*   **Database**:
    *   [Firebase Firestore](https://firebase.google.com/docs/firestore) (for storing image metadata and status)
*   **Deployment**:
    *   [Vercel](https://vercel.com/) (for the Next.js frontend)
    *   [Firebase Hosting/Functions](https://firebase.google.com/) (for backend functions)

## Getting Started & Local Development

To get a local copy up and running, follow these steps.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm, yarn, or pnpm
*   Firebase CLI (if you intend to run or deploy Firebase functions): `npm install -g firebase-tools`

### Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/selbekk/rotfest-crowdsource-app.git
    cd rotfest-crowdsource-app
    ```

2.  **Install frontend dependencies**:
    Navigate to the root directory (which contains `package.json` for the Next.js app) and run:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Install Firebase Functions dependencies**:
    Navigate to the `functions` directory and run:
    ```bash
    cd functions
    npm install
    # or
    yarn install
    # or
    pnpm install
    cd ..
    ```

4.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory of the Next.js application. You'll need to add your Firebase project configuration and any other necessary API keys (like OpenAI).
    Example `.env.local`:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"

    # If you have an OpenAI API key for any remaining backend functionality
    # OPENAI_API_KEY="your_openai_api_key" # (Typically used server-side, e.g., in Firebase Functions)
    ```
    You can get your Firebase configuration details from your Firebase project settings.

5.  **Firebase Project Setup**:
    *   Make sure you have a Firebase project created.
    *   Log in to Firebase using the CLI: `firebase login`
    *   Associate your local project with your Firebase project: `firebase use --add` and select your project.

### Running Locally

1.  **Run the Next.js development server**:
    From the root directory:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

2.  **Run Firebase Functions locally (Optional)**:
    If you need to test Firebase Functions locally (e.g., image processing triggers or other backend logic), you can use the Firebase Emulator Suite.
    From the root directory (or the `functions` directory, depending on your `firebase.json` setup):
    ```bash
    firebase emulators:start
    ```
    This will typically start emulators for Functions, Firestore, Storage, etc., on different local ports. Check the Firebase CLI output for details.

## Contributing

As this project was for a specific event and is now primarily a gallery, contributions are not actively sought. However, feel free to fork the repository and explore the code.

## License

MIT