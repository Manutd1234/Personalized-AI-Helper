from typing import List, Dict
from datetime import datetime


class AnalyticsService:
    """
    Service for calculating productivity analytics and insights.
    """
    
    def analyze(
        self,
        weekly_stats: List[dict],
        today_stats: dict,
        subject_dist: dict
    ) -> dict:
        """
        Analyze productivity data and return insights.
        """
        # Calculate totals
        total_minutes = sum(w.get("totalMinutes", 0) for w in weekly_stats)
        total_sessions = sum(w.get("sessionCount", 0) for w in weekly_stats)
        
        # Calculate weekly averages
        weeks_with_data = len([w for w in weekly_stats if w.get("totalMinutes", 0) > 0])
        avg_weekly_minutes = total_minutes / max(weeks_with_data, 1)
        
        # Calculate growth rate (week over week)
        growth_rates = []
        for i in range(1, len(weekly_stats)):
            prev = weekly_stats[i-1].get("totalMinutes", 0)
            curr = weekly_stats[i].get("totalMinutes", 0)
            if prev > 0:
                rate = ((curr - prev) / prev) * 100
                growth_rates.append(rate)
        
        avg_growth_rate = sum(growth_rates) / max(len(growth_rates), 1) if growth_rates else 0
        
        # Current vs last week
        current_week = weekly_stats[-1].get("totalMinutes", 0) if weekly_stats else 0
        last_week = weekly_stats[-2].get("totalMinutes", 0) if len(weekly_stats) >= 2 else 0
        week_change = ((current_week - last_week) / max(last_week, 1)) * 100 if last_week > 0 else 0
        
        # Find top subject
        top_subject = None
        if subject_dist:
            top_subject = max(subject_dist.items(), key=lambda x: x[1])
        
        # Calculate consistency score (percentage of weeks with activity)
        consistency_score = (weeks_with_data / max(len(weekly_stats), 1)) * 100
        
        # Determine trend
        if len(growth_rates) >= 3:
            recent_growth = sum(growth_rates[-3:]) / 3
            if recent_growth > 5:
                trend = "improving"
            elif recent_growth < -5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            consistency_score=consistency_score,
            avg_weekly_minutes=avg_weekly_minutes,
            week_change=week_change,
            trend=trend
        )
        
        return {
            "summary": {
                "totalMinutes": total_minutes,
                "totalHours": round(total_minutes / 60, 1),
                "totalSessions": total_sessions,
                "avgWeeklyMinutes": round(avg_weekly_minutes, 1),
                "avgSessionLength": round(total_minutes / max(total_sessions, 1), 1),
            },
            "growth": {
                "avgGrowthRate": round(avg_growth_rate, 1),
                "currentWeekVsLast": round(week_change, 1),
                "trend": trend,
            },
            "consistency": {
                "score": round(consistency_score, 1),
                "weeksActive": weeks_with_data,
                "totalWeeks": len(weekly_stats),
            },
            "topSubject": {
                "name": top_subject[0] if top_subject else None,
                "minutes": top_subject[1] if top_subject else 0,
            },
            "today": today_stats,
            "recommendations": recommendations,
            "weeklyData": weekly_stats,
        }
    
    def _generate_recommendations(
        self,
        consistency_score: float,
        avg_weekly_minutes: float,
        week_change: float,
        trend: str
    ) -> List[str]:
        """Generate personalized recommendations based on analytics."""
        recommendations = []
        
        # Consistency recommendations
        if consistency_score < 50:
            recommendations.append(
                "🎯 Try to study at least a little every day to build consistency. "
                "Even 15 minutes counts!"
            )
        elif consistency_score >= 80:
            recommendations.append(
                "⭐ Great consistency! You're building strong study habits. "
                "Keep maintaining this rhythm."
            )
        
        # Weekly volume recommendations
        if avg_weekly_minutes < 60:
            recommendations.append(
                "📈 Aim to gradually increase your weekly focus time. "
                "Try adding one 25-minute session per week."
            )
        elif avg_weekly_minutes >= 300:
            recommendations.append(
                "💪 Impressive dedication! Make sure you're also taking adequate breaks "
                "to avoid burnout."
            )
        
        # Trend recommendations
        if trend == "declining":
            recommendations.append(
                "📉 Your focus time has been decreasing. Consider setting specific goals "
                "or using the Pomodoro technique to regain momentum."
            )
        elif trend == "improving":
            recommendations.append(
                "🚀 You're on an upward trajectory! Keep up the great work "
                "and consider slightly increasing your daily goals."
            )
        
        # Recent performance
        if week_change < -20:
            recommendations.append(
                "💡 This week seems slower than usual. That's okay! "
                "Try to end strong with at least one focused session today."
            )
        elif week_change > 30:
            recommendations.append(
                "🎉 Amazing progress this week! You've significantly increased your focus time. "
                "Celebrate this win!"
            )
        
        return recommendations if recommendations else [
            "📊 Keep tracking your sessions to get more personalized insights!"
        ]
    
    def get_weekly_comparison(self, weekly_stats: List[dict]) -> List[dict]:
        """
        Generate week-over-week comparison data for visualization.
        """
        comparisons = []
        for i in range(1, len(weekly_stats)):
            prev = weekly_stats[i-1]
            curr = weekly_stats[i]
            
            prev_minutes = prev.get("totalMinutes", 0)
            curr_minutes = curr.get("totalMinutes", 0)
            
            change = curr_minutes - prev_minutes
            change_percent = ((change / max(prev_minutes, 1)) * 100) if prev_minutes > 0 else 0
            
            comparisons.append({
                "weekNumber": curr.get("weekNumber"),
                "year": curr.get("year"),
                "minutes": curr_minutes,
                "change": change,
                "changePercent": round(change_percent, 1),
                "improved": change > 0
            })
        
        return comparisons
