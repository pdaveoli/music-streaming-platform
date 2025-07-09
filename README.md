<p align="left">
   <img src="https://github.com/pdaveoli/music-streaming-platform/blob/main/public/logo.png" alt="logo" width="50px">
</p>
<p align="left"><h1 align="left">FreeStream Music</h1></p>
<p align="left">
    <em><code>A modern, full-stack music streaming platform.</code></em>
</p>
<p align="left">
    <img src="https://img.shields.io/github/last-commit/pdaveoli/music-streaming-platform?style=for-the-badge&logo=git&logoColor=white&color=c70000" alt="last-commit">
    <img src="https://img.shields.io/github/languages/top/pdaveoli/music-streaming-platform?style=for-the-badge&logo=typescript&logoColor=white&color=c70000" alt="repo-top-language">
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge&color=c70000" alt="license">
</p>
<p align="left">
  <a href="https://music-streaming-platform-two.vercel.app/"><strong>🚀 View Live Demo</strong></a>
</p>

---

##  Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [Project Roadmap](#project-roadmap)
  - [Potential Features](#potential-features)
- [Contributing](#contributing)
- [License](#license)

---

##  Overview

FreeStream is a feature-rich music streaming platform designed for educational purposes. It demonstrates a complete full-stack architecture, from user authentication and database management with Supabase to a dynamic, responsive frontend built with Next.js. Users can listen to songs, manage their library, create playlists, and enjoy a seamless audio experience.

---

##  Features

-   **User Authentication:** Secure sign-up and login functionality handled by Supabase Auth.
-   **Persistent Audio Player:** A site-wide audio player that continues playback while navigating.
-   **Dynamic Queue:** Add, remove, and reorder songs in a personal playback queue.
-   **Synced Lyrics View:** Real-time lyrics that scroll in sync with the currently playing song.
-   **Personal Library:** Save favorite songs and albums to a personal library.
-   **Playlist Management:** Create, view, and play custom playlists.
-   **User Profiles:** Customizable user profiles with avatars, bios, and favorite genres.
-   **Light & Dark Mode:** A theme switcher for a comfortable viewing experience.

---

##  Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

##  Project Structure

```sh
└── music-streaming-platform/
    ├── app/
    │   ├── (auth)/                 # Routes for authentication
    │   ├── (protected)/            # Logged in routes (audio player app)
    │   ├── api/                    # API routes
    │   ├── client-actions.ts       # Client-side data fetching functions
    │   ├── globals.css
    │   └── layout.tsx
    ├── components/
    │   ├── landing-components/     # Components for the marketing landing page
    │   ├── ui/                     # Reusable UI components from shadcn/ui
    │   ├── AudioPlayerUI.tsx       # The main persistent audio player
    │   └── sidebar.tsx             # The main application sidebar
    ├── lib/
    │   ├── supabase/               # Supabase client and server helpers
    │   └── utils.ts                # Utility functions (e.g., cn)
    ├── context/                    # The full audio system
    ├── public/                     # Static assets (images, fonts)
    ├── .env.example                # Example environment variables
    ├── middleware.ts               # Next.js middleware for route protection
    ├── next.config.js              # Next.js settings (mainly for image routes)
    └── package.json
```

---

##  Getting Started

###  Prerequisites

Before you begin, ensure you have the following installed:
-   Node.js (v18 or later)
-   npm (or your preferred package manager)
-   A free [Supabase](https://supabase.com) account

###  Installation

1.  Clone the repository:
    ```sh
    ❯ git clone https://github.com/pdaveoli/music-streaming-platform.git
    ```
2.  Navigate to the project directory:
    ```sh
    ❯ cd music-streaming-platform
    ```
3.  Install the dependencies:
    ```sh
    ❯ npm install
    ```
4.  Set up your environment variables:
    -   Rename `.env.local.example` to `.env.local`.
    -   Log in to your Supabase account and find your Project URL and `anon` Public Key in `Project Settings > API`.
    -   Add them to your `.env.local` file.

###  Usage

Run the development server:
```sh
❯ npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

##  Project Roadmap

-   [x] **`Feature`**: <strike>Upload albums across three distinct genres.</strike>
-   [X] **`Feature`**: <strike>Create profile system</strike>
-   [X] **`Bug`**: <strike>The audio player won't work if you queue a song without having a song playing in the first place </strike>
-   [ ] **`Feature`**: Allow users to follow each other
-   [ ] **`Feature`**: Allows users to comment on other people's playlists / profiles
-   [X] **`Feature`**: <strike>Add basic content filtering for text</strike>

### Potential Features

-   [ ] **`Feature`**: Collaberation playlists?
-   [ ] **`Feature`**: Create proper discovery page and recomendations?

---

##  Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

-   **🐛 [Report Issues](https://github.com/pdaveoli/music-streaming-platform/issues)**: Submit bugs or log feature requests.
-   **💡 [Submit Pull Requests](https://github.com/pdaveoli/music-streaming-platform/pulls)**: Review open PRs and submit your own.

<details closed>
<summary>Contributing Guidelines</summary>

1.  **Fork the Repository**: Start by forking the project repository to your GitHub account.
2.  **Create a New Branch**: Always work on a new branch for each feature or bug fix.
    ```sh
    git checkout -b feature/AmazingFeature
    ```
3.  **Make Your Changes**: Develop and test your changes locally.
4.  **Commit Your Changes**: Commit with a clear and descriptive message.
    ```sh
    git commit -m 'Add some AmazingFeature'
    ```
5.  **Push to Your Branch**: Push the changes to your forked repository.
    ```sh
    git push origin feature/AmazingFeature
    ```
6.  **Submit a Pull Request**: Create a PR against the original project repository.
</details>

---

##  License

This project is distributed under the MIT License. See `LICENSE` for more information.

