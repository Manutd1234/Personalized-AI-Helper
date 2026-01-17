#!/usr/bin/env python3
"""
Test script for AI Pomodoro Timer application
Tests all major functionality without user interaction
"""

import sys
import json
from datetime import datetime, timedelta

from pomodoro_timer import PomodoroTimer
from schedule_creator import ScheduleCreator
from data_manager import DataManager


def test_pomodoro_timer():
    """Test PomodoroTimer functionality."""
    print("Testing PomodoroTimer...")
    
    timer = PomodoroTimer()
    
    # Test initialization
    assert timer.work_duration == 25, "Default work duration should be 25"
    assert timer.short_break == 5, "Default short break should be 5"
    assert timer.current_session == 0, "Initial session should be 0"
    
    # Test starting a session
    session_info = timer.start_work_session("Math")
    assert session_info["subject"] == "Math", "Subject should be Math"
    assert timer.current_session == 1, "Session number should be 1"
    assert timer.is_running == True, "Timer should be running"
    
    # Test completing a session
    session_record = timer.complete_session("Math", interruptions=1, focus_rating=8)
    assert session_record["session_number"] == 1, "Session number should match"
    assert session_record["subject"] == "Math", "Subject should match"
    assert session_record["interruptions"] == 1, "Interruptions should match"
    assert session_record["focus_rating"] == 8, "Focus rating should match"
    
    # Add more sessions for statistics testing
    for i in range(3):
        timer.start_work_session("Science")
        timer.complete_session("Science", interruptions=0, focus_rating=7 + i)
    
    # Test statistics
    stats = timer.get_statistics()
    assert stats["total_sessions"] == 4, f"Should have 4 sessions, got {stats['total_sessions']}"
    assert "Math" in stats["subjects"], "Math should be in subjects"
    assert "Science" in stats["subjects"], "Science should be in subjects"
    
    # Test session history
    history = timer.get_session_history()
    assert len(history) == 4, "Should have 4 sessions in history"
    
    print("✅ PomodoroTimer tests passed!")
    return True


def test_schedule_creator():
    """Test ScheduleCreator functionality."""
    print("\nTesting ScheduleCreator...")
    
    creator = ScheduleCreator()
    
    # Create sample session history
    sample_history = []
    now = datetime.now()
    
    for i in range(10):
        session = {
            "session_number": i + 1,
            "subject": ["Math", "Science", "History"][i % 3],
            "start_time": (now - timedelta(hours=i)).isoformat(),
            "end_time": (now - timedelta(hours=i) + timedelta(minutes=25)).isoformat(),
            "planned_duration": 25,
            "actual_duration": 25,
            "interruptions": i % 2,
            "focus_rating": 6 + (i % 5),
            "completed": True
        }
        sample_history.append(session)
    
    # Test pattern analysis
    patterns = creator.analyze_study_patterns(sample_history)
    assert "best_time_of_day" in patterns, "Should have best time of day"
    assert "avg_session_length" in patterns, "Should have average session length"
    assert "preferred_subjects" in patterns, "Should have preferred subjects"
    
    # Test daily schedule creation
    subjects = ["Math", "Science", "History"]
    schedule = creator.create_daily_schedule(subjects, study_hours=2, session_length=25)
    assert len(schedule) > 0, "Schedule should not be empty"
    
    # Verify schedule structure
    for item in schedule:
        assert "start_time" in item, "Schedule item should have start_time"
        assert "end_time" in item, "Schedule item should have end_time"
        assert "duration" in item, "Schedule item should have duration"
        assert "type" in item, "Schedule item should have type"
    
    # Test weekly schedule creation
    week_schedule = creator.create_weekly_schedule(subjects, daily_hours=2, days=3)
    assert len(week_schedule) == 3, "Should have 3 days in schedule"
    
    # Test next session suggestion
    suggestion = creator.suggest_next_session(sample_history, subjects)
    assert "suggested_subject" in suggestion, "Should have suggested subject"
    assert "suggested_duration" in suggestion, "Should have suggested duration"
    assert suggestion["suggested_subject"] in subjects, "Suggested subject should be in subjects list"
    
    # Test insights generation
    insights = creator.generate_study_insights(sample_history)
    assert len(insights) > 0, "Should generate insights"
    assert isinstance(insights, list), "Insights should be a list"
    
    print("✅ ScheduleCreator tests passed!")
    return True


def test_data_manager():
    """Test DataManager functionality."""
    print("\nTesting DataManager...")
    
    # Use a test directory
    dm = DataManager(data_dir=".test_pomodoro_data")
    
    # Test config loading/saving
    config = dm.load_config()
    assert "work_duration" in config, "Config should have work_duration"
    assert config["work_duration"] == 25, "Default work duration should be 25"
    
    # Test config modification
    config["work_duration"] = 30
    assert dm.save_config(config), "Should save config successfully"
    
    reloaded_config = dm.load_config()
    assert reloaded_config["work_duration"] == 30, "Modified config should persist"
    
    # Test history loading/saving
    test_session = {
        "session_number": 1,
        "subject": "Test Subject",
        "start_time": datetime.now().isoformat(),
        "end_time": datetime.now().isoformat(),
        "planned_duration": 25,
        "actual_duration": 24.5,
        "interruptions": 0,
        "focus_rating": 9,
        "completed": True
    }
    
    assert dm.add_session(test_session), "Should add session successfully"
    
    history = dm.load_history()
    assert len(history) == 1, "Should have 1 session in history"
    assert history[0]["subject"] == "Test Subject", "Session subject should match"
    
    # Test today's sessions
    today_sessions = dm.get_today_sessions()
    assert len(today_sessions) == 1, "Should have 1 session today"
    
    # Test subjects update
    new_subjects = ["Physics", "Chemistry", "Biology"]
    assert dm.update_subjects(new_subjects), "Should update subjects"
    
    updated_config = dm.load_config()
    assert updated_config["subjects"] == new_subjects, "Subjects should be updated"
    
    # Test export/import
    export_path = "/tmp/test_export.json"
    assert dm.export_data(export_path), "Should export data"
    
    # Clear and reimport
    dm.clear_history()
    history_after_clear = dm.load_history()
    assert len(history_after_clear) == 0, "History should be empty after clear"
    
    assert dm.import_data(export_path), "Should import data"
    history_after_import = dm.load_history()
    assert len(history_after_import) == 1, "History should be restored after import"
    
    # Cleanup
    import shutil
    import os
    if os.path.exists(os.path.expanduser("~/.test_pomodoro_data")):
        shutil.rmtree(os.path.expanduser("~/.test_pomodoro_data"))
    if os.path.exists(export_path):
        os.remove(export_path)
    
    print("✅ DataManager tests passed!")
    return True


def test_integration():
    """Test integration of all components."""
    print("\nTesting Integration...")
    
    # Initialize all components
    dm = DataManager(data_dir=".test_integration_data")
    timer = PomodoroTimer()
    creator = ScheduleCreator()
    
    # Simulate a study session workflow
    # 1. Start a session
    session_info = timer.start_work_session("Integration Test")
    
    # 2. Complete the session
    session_record = timer.complete_session("Integration Test", interruptions=0, focus_rating=8)
    
    # 3. Save to data manager
    dm.add_session(session_record)
    
    # 4. Load history and analyze
    history = dm.load_history()
    patterns = creator.analyze_study_patterns(history)
    
    assert len(history) == 1, "Should have 1 session"
    assert "best_time_of_day" in patterns, "Should analyze patterns"
    
    # 5. Generate schedule based on patterns
    config = dm.load_config()
    schedule = creator.create_daily_schedule(
        config["subjects"],
        study_hours=2,
        session_length=config["work_duration"],
        patterns=patterns
    )
    
    assert len(schedule) > 0, "Should generate schedule"
    
    # 6. Get AI suggestion
    suggestion = creator.suggest_next_session(history, config["subjects"])
    assert "suggested_subject" in suggestion, "Should provide suggestion"
    
    # Cleanup
    import shutil
    import os
    if os.path.exists(os.path.expanduser("~/.test_integration_data")):
        shutil.rmtree(os.path.expanduser("~/.test_integration_data"))
    
    print("✅ Integration tests passed!")
    return True


def test_edge_cases():
    """Test edge cases and error handling."""
    print("\nTesting Edge Cases...")
    
    # Test with empty history
    creator = ScheduleCreator()
    empty_patterns = creator.analyze_study_patterns([])
    assert empty_patterns["best_time_of_day"] == "morning", "Should have default time"
    
    empty_insights = creator.generate_study_insights([])
    assert len(empty_insights) > 0, "Should provide default insights"
    
    # Test with minimal data
    timer = PomodoroTimer()
    stats = timer.get_statistics()
    assert stats["total_sessions"] == 0, "Empty timer should have 0 sessions"
    
    # Test with custom durations
    custom_timer = PomodoroTimer(work_duration=50, short_break=10, long_break=30)
    assert custom_timer.work_duration == 50, "Custom work duration should be set"
    assert custom_timer.short_break == 10, "Custom short break should be set"
    
    print("✅ Edge case tests passed!")
    return True


def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 AI Pomodoro Timer - Automated Tests")
    print("=" * 60)
    
    tests = [
        test_pomodoro_timer,
        test_schedule_creator,
        test_data_manager,
        test_integration,
        test_edge_cases
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
        except AssertionError as e:
            print(f"❌ Test failed: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ Test error: {e}")
            import traceback
            traceback.print_exc()
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("=" * 60)
    
    if failed == 0:
        print("✅ All tests passed!")
        return 0
    else:
        print(f"❌ {failed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
