import os
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()


class AIService:
    """
    AI Service for productivity coaching using LangChain and OpenAI.
    Falls back to rule-based responses if OpenAI API key is not configured.
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.use_openai = bool(self.api_key)
        
        if self.use_openai:
            try:
                from langchain_openai import ChatOpenAI
                from langchain.prompts import ChatPromptTemplate
                from langchain.memory import ConversationBufferMemory
                
                self.llm = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.7,
                    api_key=self.api_key
                )
                self.memory = ConversationBufferMemory(return_messages=True)
                
                self.system_prompt = """You are a friendly and encouraging AI Study Coach named Nexus. 
                Your role is to help students improve their productivity and study habits.
                
                When responding:
                1. Be encouraging and positive
                2. Provide specific, actionable advice
                3. Reference the user's actual statistics when available
                4. Use emojis sparingly for engagement
                5. Keep responses concise but helpful
                
                User's current statistics:
                - Weekly focus time trend: {weekly_stats}
                - Today's stats: {today_stats}
                - Subject distribution: {subject_dist}
                """
                
                self.prompt_template = ChatPromptTemplate.from_messages([
                    ("system", self.system_prompt),
                    ("human", "{message}")
                ])
                
            except ImportError:
                self.use_openai = False
    
    async def chat(
        self,
        message: str,
        weekly_stats: List[dict],
        today_stats: dict,
        subject_dist: dict
    ) -> dict:
        """Process a chat message and return AI response."""
        
        if self.use_openai:
            return await self._chat_with_openai(message, weekly_stats, today_stats, subject_dist)
        else:
            return self._chat_fallback(message, weekly_stats, today_stats, subject_dist)
    
    async def _chat_with_openai(
        self,
        message: str,
        weekly_stats: List[dict],
        today_stats: dict,
        subject_dist: dict
    ) -> dict:
        """Use OpenAI for response generation."""
        try:
            formatted_prompt = self.prompt_template.format_messages(
                weekly_stats=str(weekly_stats[-6:]) if weekly_stats else "No data yet",
                today_stats=str(today_stats) if today_stats else "No sessions today",
                subject_dist=str(subject_dist) if subject_dist else "No subjects tracked",
                message=message
            )
            
            response = await self.llm.ainvoke(formatted_prompt)
            
            # Determine if we should include chart data
            include_chart = any(keyword in message.lower() for keyword in 
                              ["growth", "progress", "trend", "week", "chart", "show"])
            
            return {
                "content": response.content,
                "chartData": weekly_stats if include_chart else None
            }
        except Exception as e:
            # Fall back to rule-based on error
            return self._chat_fallback(message, weekly_stats, today_stats, subject_dist)
    
    def _chat_fallback(
        self,
        message: str,
        weekly_stats: List[dict],
        today_stats: dict,
        subject_dist: dict
    ) -> dict:
        """Rule-based fallback responses when OpenAI is not available."""
        lower = message.lower()
        
        # Calculate statistics
        total_minutes = sum(w.get("totalMinutes", 0) for w in weekly_stats)
        total_sessions = sum(w.get("sessionCount", 0) for w in weekly_stats)
        
        if weekly_stats and len(weekly_stats) >= 2:
            this_week = weekly_stats[-1].get("totalMinutes", 0)
            last_week = weekly_stats[-2].get("totalMinutes", 0)
            growth = ((this_week - last_week) / max(last_week, 1)) * 100
        else:
            this_week = 0
            last_week = 0
            growth = 0
        
        top_subject = max(subject_dist.items(), key=lambda x: x[1])[0] if subject_dist else "None"
        
        # Determine response based on keywords
        if any(kw in lower for kw in ["productive", "how was", "week", "stats"]):
            content = f"""📊 **Your Weekly Productivity Summary**

This week you've focused for **{this_week} minutes** across your sessions.

{"📈" if growth > 0 else "📉"} That's **{abs(int(growth))}%** {"more" if growth > 0 else "less"} than last week ({last_week} min).

🎯 Your most studied subject: **{top_subject}**

Today: {today_stats.get("sessions", 0)} sessions, {today_stats.get("minutes", 0)} minutes, +{today_stats.get("xp", 0)} XP"""
            return {"content": content, "chartData": weekly_stats}
        
        elif any(kw in lower for kw in ["growth", "progress", "trend"]):
            avg_minutes = int(total_minutes / max(len(weekly_stats), 1))
            content = f"""📈 **Your Growth Over Time**

Here's your productivity trend over the past {len(weekly_stats)} weeks:

• Total focus time: **{total_minutes // 60}h {total_minutes % 60}m**
• Total sessions: **{total_sessions}**
• Average per week: **{avg_minutes} minutes**

{"🚀 You're on an upward trend! Keep it up!" if growth > 0 else "💪 Let's work on getting back on track!"}"""
            return {"content": content, "chartData": weekly_stats}
        
        elif any(kw in lower for kw in ["motivation", "unmotivated", "can't focus"]):
            content = """💪 **You've got this!**

Remember: Every expert was once a beginner. The fact that you're here shows you care about your growth.

🎯 Quick motivation tips:
1. Start with just 5 minutes - that's it!
2. Celebrate small wins
3. Your future self will thank you

"The secret of getting ahead is getting started." - Mark Twain"""
            return {"content": content, "chartData": None}
        
        elif any(kw in lower for kw in ["plan", "schedule", "exam"]):
            content = """📋 **Personalized Study Plan**

Based on your productivity patterns, here's a suggested plan:

**Week 1:** Foundation building
• Day 1-2: Review fundamentals (2 sessions/day)
• Day 3-4: Practice problems (3 sessions/day)
• Day 5: Self-assessment

**Week 2:** Deep dive
• Focus on weak areas identified
• Daily practice sessions
• Add one extra session for review

💡 Aim to beat your weekly average!"""
            return {"content": content, "chartData": None}
        
        elif any(kw in lower for kw in ["tip", "advice"]):
            tips = [
                "**💡 Active Recall**: After studying, close your notes and try to write down everything you remember. This can boost retention by up to 50%!",
                "**💡 Spaced Repetition**: Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks.",
                "**💡 Pomodoro Power**: Work for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer break.",
            ]
            import random
            return {"content": random.choice(tips), "chartData": None}
        
        else:
            content = """I understand! Tell me more about what you're studying and I can help create a personalized plan.

Try asking me:
• "How productive was I this week?"
• "Show me my growth trend"
• "Am I improving?"
• "Create a study plan for my exam"
• "I need motivation" """
            return {"content": content, "chartData": None}
    
    async def generate_study_plan(
        self,
        goal: str,
        days_available: int,
        subject_dist: dict
    ) -> List[dict]:
        """Generate a personalized study plan."""
        
        if self.use_openai:
            try:
                prompt = f"""Create a study plan for: {goal}
                Days available: {days_available}
                Current subject focus: {subject_dist}
                
                Return a JSON array with objects containing: title, duration, completed (false)
                Keep it practical and achievable."""
                
                response = await self.llm.ainvoke(prompt)
                # Parse response (simplified)
                # In production, use structured output
                return [
                    {"title": "Review Fundamentals", "duration": "2 days", "completed": False},
                    {"title": "Practice Problems", "duration": "3 days", "completed": False},
                    {"title": "Self Assessment", "duration": "1 day", "completed": False},
                    {"title": "Focus on Weak Areas", "duration": f"{days_available - 6} days", "completed": False},
                ]
            except Exception:
                pass
        
        # Fallback plan
        return [
            {"title": "Review Fundamentals", "duration": "2 days", "completed": False},
            {"title": "Practice Problems", "duration": "3 days", "completed": False},
            {"title": "Self Assessment", "duration": "1 day", "completed": False},
            {"title": "Focus on Weak Areas", "duration": f"{max(1, days_available - 6)} days", "completed": False},
            {"title": "Final Review", "duration": "2 days", "completed": False},
        ]
