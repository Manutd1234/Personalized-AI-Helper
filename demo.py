#!/usr/bin/env python3
"""
Demo script for AI Pomodoro Timer
Demonstrates key features without user interaction
"""

from datetime import datetime, timedelta
from pomodoro_timer import PomodoroTimer
from schedule_creator import ScheduleCreator
from data_manager import DataManager


def demo():
    """Run a demonstration of the AI Pomodoro Timer features."""
    print("=" * 70)
    print("🍅 AI Pomodoro Timer & Study Scheduler - Feature Demo 🍅".center(70))
    print("=" * 70)
    print()
    
    # Initialize components
    dm = DataManager(data_dir=".demo_pomodoro_data")
    timer = PomodoroTimer(work_duration=25, short_break=5, long_break=15)
    scheduler = ScheduleCreator()
    
    print("📚 Feature 1: Simulating Study Sessions")
    print("-" * 70)
    
    # Simulate multiple study sessions
    subjects = ["Math", "Science", "History", "English"]
    session_count = 0
    
    for i in range(12):
        subject = subjects[i % len(subjects)]
        
        # Start session
        session_info = timer.start_work_session(subject)
        session_count += 1
        
        # Simulate completion with varying focus ratings
        focus_rating = 6 + (i % 5)
        interruptions = 1 if i % 3 == 0 else 0
        
        session_record = timer.complete_session(subject, interruptions, focus_rating)
        dm.add_session(session_record)
        
        print(f"  ✓ Session {session_count}: {subject} - Focus: {focus_rating}/10")
    
    print(f"\n✅ Completed {session_count} study sessions!")
    
    # Display statistics
    print("\n📊 Feature 2: Study Statistics")
    print("-" * 70)
    
    stats = timer.get_statistics()
    print(f"  Total Sessions: {stats['total_sessions']}")
    print(f"  Total Study Time: {stats['total_time']:.1f} minutes ({stats['total_time']/60:.1f} hours)")
    print(f"  Average Focus Rating: {stats['average_focus']:.1f}/10")
    print(f"  Total Interruptions: {stats['total_interruptions']}")
    
    print("\n  Subject Breakdown:")
    for subject, data in sorted(stats['subjects'].items()):
        print(f"    • {subject}: {data['sessions']} sessions, "
              f"{data['total_time']:.0f} min, Focus: {data['avg_focus']:.1f}/10")
    
    # Analyze patterns
    print("\n🤖 Feature 3: AI Pattern Analysis")
    print("-" * 70)
    
    history = dm.load_history()
    patterns = scheduler.analyze_study_patterns(history)
    
    print(f"  Best Study Time: {patterns['best_time_of_day'].capitalize()}")
    print(f"  Average Session Length: {patterns['avg_session_length']:.1f} minutes")
    print(f"  Focus Trend: {patterns['focus_trends'].replace('_', ' ').capitalize()}")
    
    if patterns['preferred_subjects']:
        print(f"\n  Subject Performance (Best to Needs Improvement):")
        for i, subject in enumerate(patterns['preferred_subjects'], 1):
            print(f"    {i}. {subject}")
    
    # Generate insights
    print("\n💡 Feature 4: AI Study Insights")
    print("-" * 70)
    
    insights = scheduler.generate_study_insights(history)
    for i, insight in enumerate(insights, 1):
        print(f"  {i}. {insight}")
    
    # Get next session suggestion
    print("\n🎯 Feature 5: Next Session Suggestion")
    print("-" * 70)
    
    suggestion = scheduler.suggest_next_session(history, subjects)
    print(f"  Suggested Subject: {suggestion['suggested_subject']}")
    print(f"  Suggested Duration: {suggestion['suggested_duration']} minutes")
    print(f"  Reason: {suggestion['reason']}")
    
    # Generate daily schedule
    print("\n📅 Feature 6: Daily Schedule Generation")
    print("-" * 70)
    
    schedule = scheduler.create_daily_schedule(
        subjects,
        study_hours=3,
        session_length=25,
        patterns=patterns
    )
    
    print(f"  Generated schedule for 3 hours of study:")
    print()
    
    current_subject = None
    session_num = 0
    for item in schedule[:12]:  # Show first 12 items
        if item['type'] == 'work':
            if current_subject != item['subject']:
                if current_subject is not None:
                    print()
                print(f"  📚 {item['subject']}:")
                current_subject = item['subject']
            session_num += 1
            print(f"    Session {session_num}: {item['start_time']} - {item['end_time']}")
        else:
            break_type = "Long" if item['duration'] >= 15 else "Short"
            print(f"    ☕ {break_type} Break: {item['start_time']} - {item['end_time']}")
    
    if len(schedule) > 12:
        print(f"\n  ... and {len(schedule) - 12} more items")
    
    # Weekly schedule preview
    print("\n📆 Feature 7: Weekly Schedule Preview")
    print("-" * 70)
    
    week_schedule = scheduler.create_weekly_schedule(subjects, daily_hours=2, days=5)
    
    for day, day_schedule in list(week_schedule.items())[:3]:  # Show first 3 days
        work_sessions = [s for s in day_schedule if s['type'] == 'work']
        total_time = sum(s['duration'] for s in work_sessions)
        print(f"  {day}: {len(work_sessions)} sessions, {total_time} minutes")
    
    # Export data
    print("\n💾 Feature 8: Data Export")
    print("-" * 70)
    
    export_path = "/tmp/pomodoro_demo_export.json"
    if dm.export_data(export_path):
        print(f"  ✅ Data exported to: {export_path}")
        print(f"  All your study data, settings, and history are backed up!")
    
    # Summary
    print("\n" + "=" * 70)
    print("🎉 Demo Complete!")
    print("=" * 70)
    print()
    print("Key Features Demonstrated:")
    print("  ✅ Pomodoro timer with session tracking")
    print("  ✅ Detailed study statistics and analytics")
    print("  ✅ AI-powered pattern recognition")
    print("  ✅ Personalized study insights")
    print("  ✅ Smart next-session suggestions")
    print("  ✅ Automated daily schedule generation")
    print("  ✅ Weekly schedule planning")
    print("  ✅ Data export and backup")
    print()
    print("To use the full interactive application, run: python main.py")
    print()
    
    # Cleanup demo data
    import shutil
    import os
    demo_dir = os.path.expanduser("~/.demo_pomodoro_data")
    if os.path.exists(demo_dir):
        shutil.rmtree(demo_dir)


if __name__ == "__main__":
    demo()
