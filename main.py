"""
Main CLI Application for AI Pomodoro Timer
Provides a command-line interface for the Pomodoro timer with AI-powered scheduling.
"""

import os
import sys
import time
from datetime import datetime
from typing import Optional

from pomodoro_timer import PomodoroTimer
from schedule_creator import ScheduleCreator
from data_manager import DataManager


class PomodoroApp:
    """Main application class for the Pomodoro timer CLI."""
    
    def __init__(self):
        """Initialize the application."""
        self.data_manager = DataManager()
        self.config = self.data_manager.load_config()
        self.timer = PomodoroTimer(
            work_duration=self.config["work_duration"],
            short_break=self.config["short_break"],
            long_break=self.config["long_break"],
            sessions_before_long_break=self.config["sessions_before_long_break"]
        )
        self.schedule_creator = ScheduleCreator()
        
        # Load history
        history = self.data_manager.load_history()
        self.timer.load_history(history)
        
        self.running = True
        self.current_subject = None
    
    def clear_screen(self):
        """Clear the terminal screen."""
        os.system('clear' if os.name != 'nt' else 'cls')
    
    def print_header(self):
        """Print the application header."""
        print("=" * 60)
        print("🍅 AI Pomodoro Timer & Study Scheduler 🍅".center(60))
        print("=" * 60)
        print()
    
    def print_menu(self):
        """Print the main menu."""
        print("\n📋 Main Menu:")
        print("  1. Start a study session")
        print("  2. View statistics")
        print("  3. Generate daily schedule")
        print("  4. Generate weekly schedule")
        print("  5. Get AI study insights")
        print("  6. Get next session suggestion")
        print("  7. Configure settings")
        print("  8. Manage subjects")
        print("  9. Export/Import data")
        print("  0. Exit")
        print()
    
    def run_timer(self, duration_seconds: int, phase: str):
        """
        Run a countdown timer.
        
        Args:
            duration_seconds: Duration in seconds
            phase: Phase name (work/break)
        """
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        try:
            while time.time() < end_time:
                remaining = int(end_time - time.time())
                mins, secs = divmod(remaining, 60)
                
                # Clear line and print timer
                sys.stdout.write(f"\r⏱️  {phase.upper()}: {mins:02d}:{secs:02d} remaining")
                sys.stdout.flush()
                
                time.sleep(1)
            
            print("\n\n✅ Session complete!")
        except KeyboardInterrupt:
            print("\n\n⏸️  Timer interrupted")
            return False
        
        return True
    
    def start_study_session(self):
        """Start a new study session."""
        self.clear_screen()
        self.print_header()
        
        print("📚 Starting a Study Session\n")
        
        # Show available subjects
        subjects = self.config["subjects"]
        print("Available subjects:")
        for i, subject in enumerate(subjects, 1):
            print(f"  {i}. {subject}")
        print(f"  {len(subjects) + 1}. Other (custom)")
        
        # Get subject choice
        try:
            choice = int(input("\nSelect subject number: "))
            if 1 <= choice <= len(subjects):
                subject = subjects[choice - 1]
            elif choice == len(subjects) + 1:
                subject = input("Enter subject name: ").strip()
            else:
                print("Invalid choice. Using 'General Study'")
                subject = "General Study"
        except (ValueError, KeyboardInterrupt):
            print("\nCancelled.")
            return
        
        self.current_subject = subject
        
        # Start work session
        session_info = self.timer.start_work_session(subject)
        print(f"\n🎯 Starting {self.timer.work_duration} minute work session on {subject}")
        print("Focus on your task. The timer will notify you when it's time for a break.")
        print("\nPress Ctrl+C to pause/stop\n")
        
        # Run the timer
        completed = self.run_timer(self.timer.work_duration * 60, "WORK")
        
        if completed:
            # Ask for feedback
            print("\n📝 Session Feedback:")
            try:
                interruptions = int(input("How many interruptions did you have? (0-10): ") or "0")
                focus_rating = int(input("Rate your focus level (1-10): ") or "5")
            except ValueError:
                interruptions = 0
                focus_rating = 5
            
            # Complete the session
            session_record = self.timer.complete_session(subject, interruptions, focus_rating)
            self.data_manager.add_session(session_record)
            
            print(f"\n✅ Session completed! Total time: {session_record['actual_duration']:.1f} minutes")
            
            # Ask about break
            take_break = input("\nWould you like to take a break? (y/n): ").lower().strip()
            if take_break == 'y':
                self.start_break()
        else:
            print("Session was not completed.")
        
        input("\nPress Enter to continue...")
    
    def start_break(self):
        """Start a break session."""
        break_info = self.timer.start_break()
        duration = break_info["duration"]
        phase_name = "LONG BREAK" if break_info["phase"] == "long_break" else "SHORT BREAK"
        
        print(f"\n☕ Starting {duration} minute break")
        print("Relax and recharge!\n")
        
        self.run_timer(duration * 60, phase_name)
    
    def view_statistics(self):
        """Display study statistics."""
        self.clear_screen()
        self.print_header()
        
        print("📊 Study Statistics\n")
        
        stats = self.timer.get_statistics()
        
        if stats["total_sessions"] == 0:
            print("No study sessions recorded yet. Start studying to see statistics!")
        else:
            print(f"Total Sessions: {stats['total_sessions']}")
            print(f"Total Study Time: {stats['total_time']:.1f} minutes ({stats['total_time']/60:.1f} hours)")
            print(f"Average Focus Rating: {stats['average_focus']:.1f}/10")
            print(f"Total Interruptions: {stats['total_interruptions']}")
            print()
            
            print("📚 Subject Breakdown:")
            for subject, data in stats["subjects"].items():
                print(f"\n  {subject}:")
                print(f"    Sessions: {data['sessions']}")
                print(f"    Time: {data['total_time']:.1f} minutes")
                print(f"    Avg Focus: {data['avg_focus']:.1f}/10")
            
            # Today's progress
            print("\n📅 Today's Progress:")
            today_sessions = self.data_manager.get_today_sessions()
            if today_sessions:
                today_time = sum(s["actual_duration"] for s in today_sessions)
                print(f"  Sessions completed: {len(today_sessions)}")
                print(f"  Time studied: {today_time:.1f} minutes")
                goal = self.config["daily_goal_sessions"]
                progress = min(100, (len(today_sessions) / goal) * 100)
                print(f"  Daily goal progress: {progress:.0f}% ({len(today_sessions)}/{goal} sessions)")
            else:
                print("  No sessions completed today yet.")
        
        input("\nPress Enter to continue...")
    
    def generate_daily_schedule(self):
        """Generate and display a daily study schedule."""
        self.clear_screen()
        self.print_header()
        
        print("📅 Generate Daily Study Schedule\n")
        
        # Get parameters
        try:
            hours = int(input(f"Study hours available (default {self.config['daily_goal_hours']}): ") 
                        or self.config['daily_goal_hours'])
        except ValueError:
            hours = self.config['daily_goal_hours']
        
        # Analyze patterns
        history = self.data_manager.load_history()
        patterns = None
        if history:
            patterns = self.schedule_creator.analyze_study_patterns(history)
            print(f"\n💡 AI Analysis: Your best study time is during the {patterns['best_time_of_day']}")
        
        # Create schedule
        schedule = self.schedule_creator.create_daily_schedule(
            self.config["subjects"],
            hours,
            self.config["work_duration"],
            patterns
        )
        
        print(f"\n📋 Your Personalized Study Schedule ({hours} hours):\n")
        
        current_subject = None
        for item in schedule:
            if item["type"] == "work":
                if current_subject != item["subject"]:
                    print(f"\n📚 {item['subject']}:")
                    current_subject = item["subject"]
                print(f"  ⏰ {item['start_time']} - {item['end_time']} ({item['duration']} min)")
            else:
                print(f"  ☕ {item['start_time']} - {item['end_time']} (Break - {item['duration']} min)")
        
        # Save schedule option
        save = input("\n\nSave this schedule to file? (y/n): ").lower().strip()
        if save == 'y':
            filename = f"schedule_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            try:
                import json
                with open(filename, 'w') as f:
                    json.dump(schedule, f, indent=2)
                print(f"✅ Schedule saved to {filename}")
            except Exception as e:
                print(f"❌ Error saving schedule: {e}")
        
        input("\nPress Enter to continue...")
    
    def generate_weekly_schedule(self):
        """Generate and display a weekly study schedule."""
        self.clear_screen()
        self.print_header()
        
        print("📅 Generate Weekly Study Schedule\n")
        
        try:
            hours_per_day = int(input(f"Study hours per day (default {self.config['daily_goal_hours']}): ") 
                               or self.config['daily_goal_hours'])
            days = int(input("Number of study days (default 5): ") or "5")
        except ValueError:
            hours_per_day = self.config['daily_goal_hours']
            days = 5
        
        week_schedule = self.schedule_creator.create_weekly_schedule(
            self.config["subjects"],
            hours_per_day,
            days
        )
        
        print(f"\n📋 Your Weekly Study Schedule:\n")
        
        for day, schedule in week_schedule.items():
            print(f"\n{'='*50}")
            print(f"📅 {day}")
            print('='*50)
            
            for item in schedule[:10]:  # Show first 10 items per day
                if item["type"] == "work":
                    print(f"  ⏰ {item['start_time']}-{item['end_time']}: {item['subject']} ({item['duration']}min)")
                else:
                    print(f"  ☕ {item['start_time']}-{item['end_time']}: Break ({item['duration']}min)")
            
            if len(schedule) > 10:
                print(f"  ... and {len(schedule) - 10} more items")
        
        input("\nPress Enter to continue...")
    
    def show_ai_insights(self):
        """Show AI-powered study insights."""
        self.clear_screen()
        self.print_header()
        
        print("🤖 AI Study Insights\n")
        
        history = self.data_manager.load_history()
        insights = self.schedule_creator.generate_study_insights(history)
        
        if insights:
            for i, insight in enumerate(insights, 1):
                print(f"  {i}. {insight}")
        else:
            print("No insights available yet. Complete some study sessions first!")
        
        input("\nPress Enter to continue...")
    
    def get_next_suggestion(self):
        """Get AI suggestion for next study session."""
        self.clear_screen()
        self.print_header()
        
        print("💡 Next Session Suggestion\n")
        
        history = self.data_manager.load_history()
        suggestion = self.schedule_creator.suggest_next_session(
            history,
            self.config["subjects"]
        )
        
        print(f"📚 Suggested Subject: {suggestion['suggested_subject']}")
        print(f"⏱️  Suggested Duration: {suggestion['suggested_duration']} minutes")
        print(f"\n💬 {suggestion['reason']}")
        
        start = input("\nStart this session now? (y/n): ").lower().strip()
        if start == 'y':
            self.current_subject = suggestion['suggested_subject']
            # Directly start the session
            session_info = self.timer.start_work_session(self.current_subject)
            print(f"\n🎯 Starting {self.timer.work_duration} minute work session on {self.current_subject}")
            print("\nPress Ctrl+C to pause/stop\n")
            
            completed = self.run_timer(self.timer.work_duration * 60, "WORK")
            
            if completed:
                try:
                    interruptions = int(input("\nHow many interruptions? (0-10): ") or "0")
                    focus_rating = int(input("Focus rating (1-10): ") or "5")
                except ValueError:
                    interruptions = 0
                    focus_rating = 5
                
                session_record = self.timer.complete_session(self.current_subject, interruptions, focus_rating)
                self.data_manager.add_session(session_record)
                print("\n✅ Session completed!")
        
        input("\nPress Enter to continue...")
    
    def configure_settings(self):
        """Configure timer settings."""
        self.clear_screen()
        self.print_header()
        
        print("⚙️  Configure Settings\n")
        
        print("Current settings:")
        print(f"  Work duration: {self.config['work_duration']} minutes")
        print(f"  Short break: {self.config['short_break']} minutes")
        print(f"  Long break: {self.config['long_break']} minutes")
        print(f"  Sessions before long break: {self.config['sessions_before_long_break']}")
        print(f"  Daily goal: {self.config['daily_goal_sessions']} sessions / {self.config['daily_goal_hours']} hours")
        
        modify = input("\nModify settings? (y/n): ").lower().strip()
        if modify == 'y':
            try:
                self.config['work_duration'] = int(input(f"Work duration ({self.config['work_duration']}): ") 
                                                    or self.config['work_duration'])
                self.config['short_break'] = int(input(f"Short break ({self.config['short_break']}): ") 
                                                  or self.config['short_break'])
                self.config['long_break'] = int(input(f"Long break ({self.config['long_break']}): ") 
                                                 or self.config['long_break'])
                self.config['sessions_before_long_break'] = int(input(f"Sessions before long break ({self.config['sessions_before_long_break']}): ") 
                                                                 or self.config['sessions_before_long_break'])
                
                # Save config
                self.data_manager.save_config(self.config)
                
                # Update timer
                self.timer.work_duration = self.config['work_duration']
                self.timer.short_break = self.config['short_break']
                self.timer.long_break = self.config['long_break']
                self.timer.sessions_before_long_break = self.config['sessions_before_long_break']
                
                print("\n✅ Settings saved!")
            except ValueError:
                print("\n❌ Invalid input. Settings not changed.")
        
        input("\nPress Enter to continue...")
    
    def manage_subjects(self):
        """Manage study subjects."""
        self.clear_screen()
        self.print_header()
        
        print("📚 Manage Subjects\n")
        
        print("Current subjects:")
        for i, subject in enumerate(self.config["subjects"], 1):
            print(f"  {i}. {subject}")
        
        print("\nOptions:")
        print("  1. Add subject")
        print("  2. Remove subject")
        print("  3. Back to main menu")
        
        choice = input("\nSelect option: ").strip()
        
        if choice == '1':
            new_subject = input("Enter new subject name: ").strip()
            if new_subject and new_subject not in self.config["subjects"]:
                self.config["subjects"].append(new_subject)
                self.data_manager.update_subjects(self.config["subjects"])
                print(f"✅ Added '{new_subject}'")
            else:
                print("❌ Invalid or duplicate subject")
        elif choice == '2':
            try:
                idx = int(input("Enter subject number to remove: ")) - 1
                if 0 <= idx < len(self.config["subjects"]):
                    removed = self.config["subjects"].pop(idx)
                    self.data_manager.update_subjects(self.config["subjects"])
                    print(f"✅ Removed '{removed}'")
                else:
                    print("❌ Invalid subject number")
            except ValueError:
                print("❌ Invalid input")
        
        input("\nPress Enter to continue...")
    
    def export_import_data(self):
        """Export or import user data."""
        self.clear_screen()
        self.print_header()
        
        print("💾 Export/Import Data\n")
        print("  1. Export data")
        print("  2. Import data")
        print("  3. Clear history")
        print("  4. Back to main menu")
        
        choice = input("\nSelect option: ").strip()
        
        if choice == '1':
            filename = input("Export filename (default: pomodoro_export.json): ").strip()
            filename = filename or "pomodoro_export.json"
            if self.data_manager.export_data(filename):
                print(f"✅ Data exported to {filename}")
            else:
                print("❌ Export failed")
        elif choice == '2':
            filename = input("Import filename: ").strip()
            if filename and self.data_manager.import_data(filename):
                print("✅ Data imported successfully")
                # Reload config
                self.config = self.data_manager.load_config()
            else:
                print("❌ Import failed")
        elif choice == '3':
            confirm = input("⚠️  Clear all history? This cannot be undone! (yes/no): ").lower()
            if confirm == 'yes':
                self.data_manager.clear_history()
                self.timer.session_history = []
                print("✅ History cleared")
            else:
                print("Cancelled")
        
        input("\nPress Enter to continue...")
    
    def run(self):
        """Run the main application loop."""
        while self.running:
            self.clear_screen()
            self.print_header()
            self.print_menu()
            
            choice = input("Select option: ").strip()
            
            if choice == '1':
                self.start_study_session()
            elif choice == '2':
                self.view_statistics()
            elif choice == '3':
                self.generate_daily_schedule()
            elif choice == '4':
                self.generate_weekly_schedule()
            elif choice == '5':
                self.show_ai_insights()
            elif choice == '6':
                self.get_next_suggestion()
            elif choice == '7':
                self.configure_settings()
            elif choice == '8':
                self.manage_subjects()
            elif choice == '9':
                self.export_import_data()
            elif choice == '0':
                self.running = False
                print("\n👋 Thank you for using AI Pomodoro Timer! Keep studying! 🎓")
            else:
                print("Invalid option. Please try again.")
                time.sleep(1)


def main():
    """Main entry point."""
    try:
        app = PomodoroApp()
        app.run()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
