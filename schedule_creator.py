"""
AI Schedule Creator Module
Creates personalized study schedules based on user patterns and preferences.
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import random


class ScheduleCreator:
    """AI-powered schedule creator for personalized study plans."""
    
    def __init__(self):
        """Initialize the schedule creator."""
        self.user_preferences = {}
        self.performance_history = []
        
    def analyze_study_patterns(self, session_history: List[Dict]) -> Dict:
        """
        Analyze user's study patterns from session history.
        
        Args:
            session_history: List of completed study sessions
            
        Returns:
            Analysis results with insights
        """
        if not session_history:
            return {
                "best_time_of_day": "morning",
                "avg_session_length": 25,
                "preferred_subjects": [],
                "focus_trends": "insufficient_data"
            }
        
        # Analyze time of day performance
        time_performance = {"morning": [], "afternoon": [], "evening": []}
        subject_performance = {}
        
        for session in session_history:
            start_time = datetime.fromisoformat(session["start_time"])
            hour = start_time.hour
            focus = session["focus_rating"]
            subject = session["subject"]
            
            # Categorize by time of day
            if 6 <= hour < 12:
                time_performance["morning"].append(focus)
            elif 12 <= hour < 18:
                time_performance["afternoon"].append(focus)
            else:
                time_performance["evening"].append(focus)
            
            # Track subject performance
            if subject not in subject_performance:
                subject_performance[subject] = []
            subject_performance[subject].append(focus)
        
        # Find best time of day
        avg_by_time = {
            time: sum(scores) / len(scores) if scores else 0
            for time, scores in time_performance.items()
        }
        best_time = max(avg_by_time, key=avg_by_time.get)
        
        # Calculate average session length
        avg_length = sum(s["actual_duration"] for s in session_history) / len(session_history)
        
        # Sort subjects by performance
        subject_rankings = [
            (subject, sum(scores) / len(scores))
            for subject, scores in subject_performance.items()
        ]
        subject_rankings.sort(key=lambda x: x[1], reverse=True)
        
        return {
            "best_time_of_day": best_time,
            "avg_session_length": round(avg_length, 1),
            "preferred_subjects": [s[0] for s in subject_rankings],
            "focus_trends": "improving" if self._is_improving(session_history) else "stable",
            "time_performance": avg_by_time
        }
    
    def _is_improving(self, session_history: List[Dict]) -> bool:
        """Check if focus ratings are improving over time."""
        if len(session_history) < 4:
            return False
        
        # Compare first half to second half
        mid = len(session_history) // 2
        first_half_avg = sum(s["focus_rating"] for s in session_history[:mid]) / mid
        second_half_avg = sum(s["focus_rating"] for s in session_history[mid:]) / (len(session_history) - mid)
        
        return second_half_avg > first_half_avg
    
    def create_daily_schedule(self, subjects: List[str], 
                            study_hours: int = 4,
                            session_length: int = 25,
                            patterns: Optional[Dict] = None) -> List[Dict]:
        """
        Create a daily study schedule.
        
        Args:
            subjects: List of subjects to study
            study_hours: Total hours available for study
            session_length: Length of each study session in minutes
            patterns: Optional patterns from analyze_study_patterns
            
        Returns:
            List of scheduled study sessions
        """
        schedule = []
        
        # Determine optimal start time based on patterns
        if patterns and patterns.get("best_time_of_day"):
            best_time = patterns["best_time_of_day"]
            if best_time == "morning":
                start_hour = 8
            elif best_time == "afternoon":
                start_hour = 14
            else:
                start_hour = 18
        else:
            start_hour = 9  # Default to 9 AM
        
        # Calculate number of sessions
        total_minutes = study_hours * 60
        sessions_per_subject = {}
        
        # Distribute sessions among subjects
        if patterns and patterns.get("preferred_subjects"):
            # Prioritize subjects that need more work (lower focus ratings)
            ordered_subjects = list(reversed(patterns["preferred_subjects"]))
        else:
            ordered_subjects = subjects
        
        # Simple distribution: allocate sessions evenly
        base_sessions = total_minutes // (session_length + 5)  # +5 for break
        sessions_per_subject = {subject: base_sessions // len(subjects) for subject in subjects}
        
        # Add extra sessions to subjects that need more work
        remaining = base_sessions - sum(sessions_per_subject.values())
        for i in range(remaining):
            subject = ordered_subjects[i % len(ordered_subjects)]
            sessions_per_subject[subject] += 1
        
        # Create the schedule
        current_time = datetime.now().replace(hour=start_hour, minute=0, second=0, microsecond=0)
        session_number = 1
        
        for subject, num_sessions in sessions_per_subject.items():
            for _ in range(num_sessions):
                session = {
                    "session_number": session_number,
                    "subject": subject,
                    "start_time": current_time.strftime("%H:%M"),
                    "end_time": (current_time + timedelta(minutes=session_length)).strftime("%H:%M"),
                    "duration": session_length,
                    "type": "work"
                }
                schedule.append(session)
                
                # Add break
                current_time += timedelta(minutes=session_length)
                break_duration = 15 if session_number % 4 == 0 else 5
                
                break_session = {
                    "session_number": session_number,
                    "subject": "Break",
                    "start_time": current_time.strftime("%H:%M"),
                    "end_time": (current_time + timedelta(minutes=break_duration)).strftime("%H:%M"),
                    "duration": break_duration,
                    "type": "break"
                }
                schedule.append(break_session)
                
                current_time += timedelta(minutes=break_duration)
                session_number += 1
        
        return schedule
    
    def create_weekly_schedule(self, subjects: List[str],
                              daily_hours: int = 4,
                              days: int = 5) -> Dict[str, List[Dict]]:
        """
        Create a weekly study schedule.
        
        Args:
            subjects: List of subjects to study
            daily_hours: Hours per day for study
            days: Number of days to schedule
            
        Returns:
            Dictionary mapping day names to daily schedules
        """
        week_schedule = {}
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        for i in range(days):
            day_name = day_names[i]
            # Rotate subjects for variety
            rotated_subjects = subjects[i % len(subjects):] + subjects[:i % len(subjects)]
            week_schedule[day_name] = self.create_daily_schedule(
                rotated_subjects, 
                daily_hours
            )
        
        return week_schedule
    
    def suggest_next_session(self, session_history: List[Dict],
                           subjects: List[str]) -> Dict:
        """
        Suggest the next study session based on history and patterns.
        
        Args:
            session_history: Past study sessions
            subjects: Available subjects to study
            
        Returns:
            Suggestion for next session
        """
        patterns = self.analyze_study_patterns(session_history)
        
        # Find subject that needs most attention
        if patterns["preferred_subjects"]:
            # Suggest subject with lowest recent performance
            suggested_subject = patterns["preferred_subjects"][-1]
        else:
            suggested_subject = subjects[0] if subjects else "General Study"
        
        # Calculate recent study frequency
        recent_sessions = session_history[-10:] if len(session_history) >= 10 else session_history
        subject_counts = {}
        for session in recent_sessions:
            subj = session["subject"]
            subject_counts[subj] = subject_counts.get(subj, 0) + 1
        
        # Suggest least recently studied subject
        if subject_counts:
            suggested_subject = min(subject_counts, key=subject_counts.get)
        
        current_hour = datetime.now().hour
        time_of_day = "morning" if 6 <= current_hour < 12 else "afternoon" if 12 <= current_hour < 18 else "evening"
        
        return {
            "suggested_subject": suggested_subject,
            "suggested_duration": int(patterns["avg_session_length"]) if patterns["avg_session_length"] else 25,
            "current_time_performance": patterns.get("time_performance", {}).get(time_of_day, "unknown"),
            "reason": f"This subject needs attention and current time ({time_of_day}) aligns with your study patterns."
        }
    
    def generate_study_insights(self, session_history: List[Dict]) -> List[str]:
        """
        Generate AI-powered insights about study habits.
        
        Args:
            session_history: List of study sessions
            
        Returns:
            List of insight strings
        """
        insights = []
        
        if not session_history:
            insights.append("Start tracking your study sessions to receive personalized insights!")
            return insights
        
        patterns = self.analyze_study_patterns(session_history)
        stats_by_subject = {}
        
        for session in session_history:
            subject = session["subject"]
            if subject not in stats_by_subject:
                stats_by_subject[subject] = {"count": 0, "avg_focus": 0, "interruptions": 0}
            stats_by_subject[subject]["count"] += 1
            stats_by_subject[subject]["avg_focus"] += session["focus_rating"]
            stats_by_subject[subject]["interruptions"] += session["interruptions"]
        
        # Calculate averages
        for subject in stats_by_subject:
            count = stats_by_subject[subject]["count"]
            stats_by_subject[subject]["avg_focus"] /= count
        
        # Generate insights
        insights.append(f"Your most productive time is during the {patterns['best_time_of_day']}.")
        
        if patterns["focus_trends"] == "improving":
            insights.append("Great job! Your focus levels are improving over time.")
        
        if stats_by_subject:
            best_subject = max(stats_by_subject, key=lambda x: stats_by_subject[x]["avg_focus"])
            insights.append(f"You have the highest focus when studying {best_subject}.")
            
            most_studied = max(stats_by_subject, key=lambda x: stats_by_subject[x]["count"])
            insights.append(f"{most_studied} is your most frequently studied subject.")
        
        # Interruption analysis
        total_interruptions = sum(s["interruptions"] for s in session_history)
        if total_interruptions > len(session_history) * 2:
            insights.append("Consider finding a quieter study environment to reduce interruptions.")
        elif total_interruptions == 0:
            insights.append("Excellent! You're maintaining great focus with no interruptions.")
        
        return insights
