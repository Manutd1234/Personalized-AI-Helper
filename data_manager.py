"""
Data Manager Module
Handles data persistence for user preferences and session history.
"""

import json
import os
from typing import Dict, List, Optional
from datetime import datetime


class DataManager:
    """Manages data persistence for the Pomodoro timer application."""
    
    def __init__(self, data_dir: str = ".pomodoro_data"):
        """
        Initialize the data manager.
        
        Args:
            data_dir: Directory to store data files
        """
        self.data_dir = os.path.expanduser(f"~/{data_dir}")
        self.config_file = os.path.join(self.data_dir, "config.json")
        self.history_file = os.path.join(self.data_dir, "history.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize default configuration
        self.default_config = {
            "work_duration": 25,
            "short_break": 5,
            "long_break": 15,
            "sessions_before_long_break": 4,
            "subjects": ["Math", "Science", "History", "English"],
            "daily_goal_sessions": 8,
            "daily_goal_hours": 4
        }
    
    def load_config(self) -> Dict:
        """
        Load user configuration from file.
        
        Returns:
            Configuration dictionary
        """
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    # Merge with defaults for any missing keys
                    return {**self.default_config, **config}
            except json.JSONDecodeError:
                print("Warning: Config file corrupted. Using defaults.")
                return self.default_config.copy()
        else:
            # Save default config
            self.save_config(self.default_config)
            return self.default_config.copy()
    
    def save_config(self, config: Dict) -> bool:
        """
        Save user configuration to file.
        
        Args:
            config: Configuration dictionary to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False
    
    def load_history(self) -> List[Dict]:
        """
        Load session history from file.
        
        Returns:
            List of session records
        """
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print("Warning: History file corrupted. Starting fresh.")
                return []
        return []
    
    def save_history(self, history: List[Dict]) -> bool:
        """
        Save session history to file.
        
        Args:
            history: List of session records
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(self.history_file, 'w') as f:
                json.dump(history, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving history: {e}")
            return False
    
    def add_session(self, session: Dict) -> bool:
        """
        Add a new session to history and save.
        
        Args:
            session: Session record to add
            
        Returns:
            True if successful, False otherwise
        """
        history = self.load_history()
        history.append(session)
        return self.save_history(history)
    
    def get_today_sessions(self) -> List[Dict]:
        """
        Get sessions completed today.
        
        Returns:
            List of today's sessions
        """
        history = self.load_history()
        today = datetime.now().date()
        
        today_sessions = []
        for session in history:
            session_date = datetime.fromisoformat(session["start_time"]).date()
            if session_date == today:
                today_sessions.append(session)
        
        return today_sessions
    
    def get_week_sessions(self) -> List[Dict]:
        """
        Get sessions from the past 7 days.
        
        Returns:
            List of this week's sessions
        """
        history = self.load_history()
        today = datetime.now().date()
        
        week_sessions = []
        for session in history:
            session_date = datetime.fromisoformat(session["start_time"]).date()
            days_ago = (today - session_date).days
            if 0 <= days_ago < 7:
                week_sessions.append(session)
        
        return week_sessions
    
    def export_data(self, export_path: str) -> bool:
        """
        Export all data to a specified path.
        
        Args:
            export_path: Path to export data to
            
        Returns:
            True if successful, False otherwise
        """
        try:
            export_data = {
                "config": self.load_config(),
                "history": self.load_history(),
                "export_date": datetime.now().isoformat()
            }
            
            with open(export_path, 'w') as f:
                json.dump(export_data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error exporting data: {e}")
            return False
    
    def import_data(self, import_path: str) -> bool:
        """
        Import data from a file.
        
        Args:
            import_path: Path to import data from
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(import_path, 'r') as f:
                import_data = json.load(f)
            
            if "config" in import_data:
                self.save_config(import_data["config"])
            if "history" in import_data:
                self.save_history(import_data["history"])
            
            return True
        except Exception as e:
            print(f"Error importing data: {e}")
            return False
    
    def clear_history(self) -> bool:
        """
        Clear all session history.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.save_history([])
            return True
        except Exception as e:
            print(f"Error clearing history: {e}")
            return False
    
    def update_subjects(self, subjects: List[str]) -> bool:
        """
        Update the list of subjects in configuration.
        
        Args:
            subjects: List of subject names
            
        Returns:
            True if successful, False otherwise
        """
        config = self.load_config()
        config["subjects"] = subjects
        return self.save_config(config)
