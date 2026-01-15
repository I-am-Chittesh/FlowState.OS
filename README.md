# FlowState.OS

> **The Operating System for Deep Work.** > A mobile-first, math-based productivity environment designed to bridge the gap between *planning* and *doing*.

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange)
![License](https://img.shields.io/badge/License-MIT-blue)
![Vibe](https://img.shields.io/badge/Vibe-Locked%20In-black)

---

## The Philosophy
Most student apps are just digital to-do lists. They wait for you to input tasks. 

**FlowState.os** is a **Strategist**.
It uses **Dynamic Backwards Planning** algorithms to calculate exactly how much work you need to do *today* based on your exam dates and current velocity. It doesn't just count down time; it manages your stress.

Combined with a **State-Machine Pomodoro Engine** and **Spotify Integration**, it creates a unified "Study OS" that locks you into a flow state.

---

## Key Features

###  Logic Core
- **Reverse Scheduling:** Input your Exam Date + Total Syllabus. The app calculates your `Daily Velocity` (e.g., "1.5 Chapters/Day").
- **Dynamic Recalculation:** Miss a day? The pressure gauge rises. Work ahead? You earn a buffer day.
- **Visual Pressure:** UI turns Red/Green based on your real-time mathematical feasibility of passing.

### Pomo Timer
- **Immersive Timer:** A distraction-free "Lockdown Mode" that takes over the screen.
- **State Management:** Handles Focus, Short Break, and Long Break states automatically.
- **Fluid Motion:** Physics-based animations (Springs) make the interface feel alive and heavy.

### Music Timer Integration
- **Spotify Integration:** Built-in player (Premium) or Remote Control (Free).
- **Auto-DJ:** Automatically plays "Focus" playlists when the timer starts and switches to "Chill" beats during breaks.

---

## The Tech Stack

Built with a **Mobile-First** architecture using modern web standards.

| Domain | Technology | Reason |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) | App Router & Server Actions for performance. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict typing for complex logic safety. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Rapid UI development with custom design system. |
| **State** | [Zustand](https://github.com/pmndrs/zustand) | Global state for Timer/Music synchronization. |
| **Motion** | [Framer Motion](https://www.framer.com/motion/) | Shared Layout & Spring Physics animations. |
| **Platform** | [PWA](https://web.dev/progressive-web-apps/) | Installable as a native app on iOS/Android. |
| **Deployment** | [Netlify](https://www.netlify.com/) | Continuous Deployment & Edge handling. |

---

## Directory Structure

We use a feature-based architecture to keep "Dumb UI" separate from "Smart Logic".

```bash
src/
├── app/                      # The Routes (Pages)
│   ├── layout.tsx            # The "Mobile Container" Wrapper
│   ├── page.tsx              # Redirects to /dashboard
│   ├── globals.css           # Global Styles & Variables
│   │
│   ├── (routes)/             # Grouped Routes (Keeps URL clean)
│   │   ├── dashboard/        # The Strategist View
│   │   │   └── page.tsx
│   │   ├── timer/            # The Focus Engine View
│   │   │   └── page.tsx
│   │   └── settings/         # Config & Spotify Toggle
│   │       └── page.tsx
│   │
│   └── api/                  # Backend API (for Spotify Token)
│       └── auth/
│           └── [...nextauth]/route.ts
│
├── components/               # The Lego Blocks
│   ├── ui/                   # "Dumb" Reusable bits (Buttons, Cards)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Slider.tsx
│   │   └── Input.tsx
│   │
│   ├── layout/               # Structural Blocks
│   │   ├── MobileShell.tsx   # The Phone Frame logic
│   │   └── BottomNav.tsx     # The Sticky Footer
│   │
│   └── modules/              # "Smart" Features (Complex Logic)
│       ├── dashboard/
│       │   ├── ExamList.tsx
│       │   └── AddExamForm.tsx
│       ├── timer/
│       │   ├── TimerCircle.tsx
│       │   └── TimerControls.tsx
│       └── music/
│           ├── PlayerBar.tsx
│           └── SpotifyAuth.tsx
│
├── lib/                      # Utilities & Helpers
│   ├── utils.ts              # Class name mergers (clsx)
│   ├── calculations.ts       # The "Strategist" Math Logic
│   ├── spotify.ts            # Spotify SDK Helper functions
│   └── constants.ts          # Default settings
│
├── hooks/                    # Custom React Hooks (Logic only)
│   ├── useTimer.ts           # The Stopwatch Logic
│   └── useAudio.ts           # Sound effects
│
├── store/                    # Global State (Zustand)
│   └── useStudyStore.ts      # Holds Exams, Settings, & User Data
│
└── types/                    # TypeScript Definitions
    └── index.ts              # Interfaces (Exam, Task, User)

```
___________________________________________________________________________________________________________________
🤝 Contributing
Contributions are welcome! Please open an issue first to discuss what you would like to change.
## Made with ❤️ by I-am-Chittesh
