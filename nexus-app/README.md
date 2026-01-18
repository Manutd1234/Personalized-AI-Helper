# Nexus - AI-Powered Student Companion

A modern productivity app with Pomodoro timer, gamification, and AI-powered study coaching.

## Tech Stack

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Chart.js / react-chartjs-2
- **Icons**: Lucide React

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **AI**: LangChain + OpenAI (gpt-4o-mini)
- **Analytics**: Custom analytics service

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- (Optional) OpenAI API key for AI features

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Optional: Add your OpenAI API key
export OPENAI_API_KEY=your_key_here

uvicorn app.main:app --reload
```

API available at [http://localhost:8000](http://localhost:8000)

## Features

### 🎯 Dashboard
- Quick stats overview
- Weekly progress chart
- Study plan preview
- Quick focus start

### ⏱️ Focus Timer
- Pomodoro timer (25/50/90 min presets)
- Subject tracking
- Session completion celebration
- XP rewards

### ✅ Tasks
- Add/complete/delete tasks
- Priority levels (low/medium/high)
- Subject categorization
- Start focus from task

### 📊 Analytics
- Weekly growth chart
- Subject distribution
- Daily focus trends
- Session history

### 🤖 AI Coach
- Chat about productivity
- "How productive was I this week?"
- "Show me my growth trend"
- "Am I improving?"
- Inline charts in responses

### 🛍️ XP Shop
- Spend earned XP on features
- Themes, sounds, boosts
- Gamification rewards

## Project Structure

```
nexus-app/
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   └── store/         # Zustand state
│   ├── package.json
│   └── tailwind.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI entry
│   │   ├── routes/        # API endpoints
│   │   └── services/      # Business logic
│   └── requirements.txt
└── .env.example
```

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel
```

### Backend → Render/Railway
Deploy the `backend/` folder with:
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## License

MIT
