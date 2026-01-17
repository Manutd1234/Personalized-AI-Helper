"""
Pomodoro Timer Module
Implements a customizable Pomodoro timer with session tracking.
"""

import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional


class PomodoroTimer:
    """A Pomodoro timer with customizable work/break intervals."""
    
    DEFAULT_WORK_DURATION = 25  # minutes
    DEFAULT_SHORT_BREAK = 5     # minutes
    DEFAULT_LONG_BREAK = 15     # minutes
    DEFAULT_SESSIONS_BEFORE_LONG_BREAK = 4
    
    def __init__(self, work_duration: int = DEFAULT_WORK_DURATION,
                 short_break: int = DEFAULT_SHORT_BREAK,
                 long_break: int = DEFAULT_LONG_BREAK,
                 sessions_before_long_break: int = DEFAULT_SESSIONS_BEFORE_LONG_BREAK):
        """
        Initialize the Pomodoro timer.
        
        Args:
            work_duration: Duration of work session in minutes
            short_break: Duration of short break in minutes
            long_break: Duration of long break in minutes
            sessions_before_long_break: Number of sessions before a long break
        """
        self.work_duration = work_duration
        self.short_break = short_break
        self.long_break = long_break
        self.sessions_before_long_break = sessions_before_long_break
        
        self.current_session = 0
        self.session_history: List[Dict] = []
        self.is_running = False
        self.is_paused = False
        self.current_phase = "work"  # "work", "short_break", or "long_break"
        self.time_remaining = 0
        self.start_time: Optional[datetime] = None
        
    def start_work_session(self, subject: str = "Study") -> Dict:
        """
        Start a new work session.
        
        Args:
            subject: The subject or task being worked on
            
        Returns:
            Dictionary with session details
        """
        self.current_session += 1
        self.current_phase = "work"
        self.time_remaining = self.work_duration * 60  # Convert to seconds
        self.is_running = True
        self.is_paused = False
        self.start_time = datetime.now()
        
        session_info = {
            "session_number": self.current_session,
            "phase": self.current_phase,
            "subject": subject,
            "duration": self.work_duration,
            "start_time": self.start_time.isoformat(),
            "completed": False
        }
        
        return session_info
    
    def start_break(self) -> Dict:
        """
        Start a break session (short or long based on session count).
        
        Returns:
            Dictionary with break details
        """
        # Determine if it's a long break
        is_long_break = (self.current_session % self.sessions_before_long_break == 0)
        
        if is_long_break:
            self.current_phase = "long_break"
            duration = self.long_break
        else:
            self.current_phase = "short_break"
            duration = self.short_break
        
        self.time_remaining = duration * 60  # Convert to seconds
        self.is_running = True
        self.is_paused = False
        self.start_time = datetime.now()
        
        break_info = {
            "phase": self.current_phase,
            "duration": duration,
            "start_time": self.start_time.isoformat()
        }
        
        return break_info
    
    def pause(self) -> bool:
        """Pause the current timer."""
        if self.is_running and not self.is_paused:
            self.is_paused = True
            return True
        return False
    
    def resume(self) -> bool:
        """Resume a paused timer."""
        if self.is_running and self.is_paused:
            self.is_paused = False
            return True
        return False
    
    def stop(self) -> bool:
        """Stop the current timer."""
        if self.is_running:
            self.is_running = False
            self.is_paused = False
            return True
        return False
    
    def complete_session(self, subject: str, interruptions: int = 0, 
                        focus_rating: int = 5) -> Dict:
        """
        Complete the current work session and record it.
        
        Args:
            subject: The subject studied
            interruptions: Number of interruptions during session
            focus_rating: Self-rated focus level (1-10)
            
        Returns:
            Session summary
        """
        end_time = datetime.now()
        duration_actual = (end_time - self.start_time).total_seconds() / 60
        
        session_record = {
            "session_number": self.current_session,
            "subject": subject,
            "start_time": self.start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "planned_duration": self.work_duration,
            "actual_duration": round(duration_actual, 2),
            "interruptions": interruptions,
            "focus_rating": focus_rating,
            "completed": True
        }
        
        self.session_history.append(session_record)
        self.is_running = False
        
        return session_record
    
    def get_statistics(self) -> Dict:
        """
        Get statistics about completed sessions.
        
        Returns:
            Dictionary with various statistics
        """
        if not self.session_history:
            return {
                "total_sessions": 0,
                "total_time": 0,
                "average_focus": 0,
                "total_interruptions": 0,
                "subjects": {}
            }
        
        total_time = sum(s["actual_duration"] for s in self.session_history)
        total_interruptions = sum(s["interruptions"] for s in self.session_history)
        avg_focus = sum(s["focus_rating"] for s in self.session_history) / len(self.session_history)
        
        # Calculate per-subject statistics
        subjects = {}
        for session in self.session_history:
            subject = session["subject"]
            if subject not in subjects:
                subjects[subject] = {
                    "sessions": 0,
                    "total_time": 0,
                    "avg_focus": 0
                }
            subjects[subject]["sessions"] += 1
            subjects[subject]["total_time"] += session["actual_duration"]
            subjects[subject]["avg_focus"] += session["focus_rating"]
        
        # Calculate averages for subjects
        for subject in subjects:
            subjects[subject]["avg_focus"] /= subjects[subject]["sessions"]
            subjects[subject]["avg_focus"] = round(subjects[subject]["avg_focus"], 2)
            subjects[subject]["total_time"] = round(subjects[subject]["total_time"], 2)
        
        return {
            "total_sessions": len(self.session_history),
            "total_time": round(total_time, 2),
            "average_focus": round(avg_focus, 2),
            "total_interruptions": total_interruptions,
            "subjects": subjects
        }
    
    def get_session_history(self) -> List[Dict]:
        """Get the complete session history."""
        return self.session_history
    
    def load_history(self, history: List[Dict]) -> None:
        """Load session history from saved data."""
        self.session_history = history
        if history:
            self.current_session = max(s["session_number"] for s in history)
    
    def format_time(self, seconds: int) -> str:
        """Format seconds as MM:SS."""
        minutes = seconds // 60
        secs = seconds % 60
        return f"{minutes:02d}:{secs:02d}"
