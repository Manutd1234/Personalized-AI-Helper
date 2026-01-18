from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.ai_service import AIService
from app.services.analytics_service import AnalyticsService

router = APIRouter()
ai_service = AIService()
analytics_service = AnalyticsService()


class WeeklyStats(BaseModel):
    weekNumber: int
    year: int
    totalMinutes: int
    sessionCount: int


class ChatRequest(BaseModel):
    message: str
    weeklyStats: List[WeeklyStats] = []
    todayStats: dict = {}
    subjectDistribution: dict = {}


class ChatResponse(BaseModel):
    content: str
    chartData: Optional[List[WeeklyStats]] = None


class AnalyzeRequest(BaseModel):
    weeklyStats: List[WeeklyStats]
    todayStats: dict
    subjectDistribution: dict


class StudyPlanRequest(BaseModel):
    goal: str
    daysAvailable: int
    subjectDistribution: dict = {}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the AI productivity coach.
    The AI can answer questions about productivity, provide statistics analysis,
    and offer personalized study tips.
    """
    try:
        response = await ai_service.chat(
            message=request.message,
            weekly_stats=request.weeklyStats,
            today_stats=request.todayStats,
            subject_dist=request.subjectDistribution
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-stats")
async def analyze_stats(request: AnalyzeRequest):
    """
    Get AI-powered analysis of productivity statistics.
    Returns insights about growth, patterns, and recommendations.
    """
    try:
        analysis = analytics_service.analyze(
            weekly_stats=request.weeklyStats,
            today_stats=request.todayStats,
            subject_dist=request.subjectDistribution
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-plan")
async def generate_study_plan(request: StudyPlanRequest):
    """
    Generate a personalized study plan based on user goals and available time.
    """
    try:
        plan = await ai_service.generate_study_plan(
            goal=request.goal,
            days_available=request.daysAvailable,
            subject_dist=request.subjectDistribution
        )
        return {"plan": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
