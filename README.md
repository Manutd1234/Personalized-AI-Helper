# Nexus - AI-Powered Student Companion 🎯

An AI-native productivity application designed specifically for students, featuring a Pomodoro timer, gamification, task management, habit tracking, analytics, and an intelligent AI study coach.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase)

## 🌐 Live Demo

**Try Nexus now:** [https://frontend-virid-tau-70.vercel.app](https://frontend-virid-tau-70.vercel.app)

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Login Page
![Login](docs/images/00_login_page.png)

### Dashboard
![Dashboard](docs/images/01_dashboard.png)

### Focus Timer
![Focus Timer](docs/images/02_focus_timer.png)

### Tasks
![Tasks](docs/images/03_tasks.png)

### Habits
![Habits](docs/images/04_habits.png)

### Analytics
![Analytics](docs/images/05_analytics.png)

### XP Shop
![Shop](docs/images/06_shop.png)

### AI Coach
![AI Coach](docs/images/07_ai_coach.png)

</details>

---

## ✨ Features

### 🔐 Authentication
- **Google OAuth** - Quick sign-in with Google
- **GitHub OAuth** - Perfect for student developers
- **Email/Password** - Traditional authentication
- Powered by Supabase Auth

### 🎯 Dashboard
- Quick stats overview (focus time, tasks, streak, sessions)
- Weekly progress chart with Chart.js
- Study plan preview from AI Coach
- Quick focus widget to start immediately

### ⏱️ Pomodoro Timer
- 25/50/90 minute presets for different study needs
- Subject tracking (Math, Science, English, etc.)
- XP rewards on session completion
- Visual circular countdown timer

### ✅ Task Management
- Create, edit, and delete tasks
- Filter by All, Active, or Completed
- Priority levels for organization
- Never miss assignments or deadlines

### 📅 Habit Tracking
- Daily habit creation and tracking
- Visual calendar with streak display
- Completion status indicators
- Build consistent study routines

### 📊 Analytics
- Weekly growth visualization (line chart)
- Subject distribution (doughnut chart)
- Session history log
- Track improvement over time

### 🤖 AI Productivity Coach
Ask questions and get intelligent responses:
- "How productive was I this week?" → Stats + weekly chart
- "Show me my growth trend" → 12-week line chart  
- "Am I improving?" → Week-over-week comparison
- "Create a study plan" → Personalized schedule
- "I need motivation" → Encouraging tips

### 🎮 Gamification (XP Shop)
- XP system for completed sessions
- Level progression
- Shop with themes, features, and boosts
- Streak tracking and rewards

---

## 🎯 How Nexus Helps Students

| Feature | Student Benefit |
|---------|-----------------|
| **Focus Timer** | Structured study sessions prevent burnout |
| **Task Management** | Never miss assignments or deadlines |
| **Habit Tracking** | Build consistent study routines |
| **Analytics** | Understand and improve study patterns |
| **XP Gamification** | Stay motivated through rewards |
| **AI Coach** | Personal tutor available 24/7 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Authentication | Supabase Auth (Google, GitHub, Email) |
| State | Zustand (persisted to localStorage) |
| Charts | Chart.js / react-chartjs-2 |
| Backend | FastAPI (Python) |
| AI | LangChain + OpenAI (gpt-4o-mini) |
| Deployment | Vercel (Frontend) |

---

## 🚀 Quick Start

### Frontend
```bash
cd nexus-app/frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Backend (Optional - for advanced AI)
```bash
cd nexus-app/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=your_key  # Optional
uvicorn app.main:app --reload
```
API at [http://localhost:8000](http://localhost:8000)

> **Note**: Frontend works standalone with localStorage. Backend only needed for OpenAI-powered responses.

---

## 📁 Project Structure

```
├── nexus-app/
│   ├── frontend/          # Next.js 14 + TypeScript
│   │   ├── src/app/       # Pages (7 routes)
│   │   ├── src/components/# React components
│   │   └── src/store/     # Zustand state
│   ├── backend/           # FastAPI + Python
│   │   └── app/
│   │       ├── routes/    # API endpoints
│   │       └── services/  # AI & analytics
│   └── README.md
├── docs/
│   ├── images/            # Feature screenshots
│   ├── implementation_plan.md
│   └── walkthrough.md
└── README.md
```

---

## 📄 Documentation

- [Implementation Plan](docs/implementation_plan.md) - Technical architecture & decisions
- [Walkthrough](docs/walkthrough.md) - How to use each feature with screenshots

---

## 🚢 Deployment

**Frontend → Vercel** (Already deployed)
- Live at: https://frontend-virid-tau-70.vercel.app

**Backend → Render/Railway** (Optional)
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 👤 Target Audience

Nexus is designed for **students** who want to:
- Improve study habits and consistency
- Track productivity across subjects
- Stay motivated through gamification
- Get AI-powered study guidance
- Manage assignments and deadlines effectively

---

## License

MIT
