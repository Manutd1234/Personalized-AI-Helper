# Personalized AI Helper 🍅

An AI-powered Pomodoro timer and study scheduler that helps students study effectively by tracking productivity and creating personalized study schedules.

## Features

### 🍅 Pomodoro Timer
- Customizable work and break intervals
- Automatic session tracking
- Focus rating and interruption logging
- Session history with detailed statistics

### 🤖 AI-Powered Schedule Creation
- Personalized daily and weekly study schedules
- Smart subject rotation and time allocation
- Analysis of study patterns and peak performance times
- Adaptive recommendations based on your study habits

### 📊 Study Analytics
- Track total study time and sessions
- Per-subject performance analysis
- Daily and weekly progress tracking
- Focus trend analysis

### 💡 Intelligent Insights
- Identifies your most productive study times
- Suggests optimal subjects for current time
- Provides personalized study recommendations
- Tracks improvement over time

## Installation

### Prerequisites
- Python 3.7 or higher

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Manutd1234/Personalized-AI-Helper.git
cd Personalized-AI-Helper
```

2. (Optional) Install dependencies:
```bash
pip install -r requirements.txt
```

Note: The application uses only Python standard library, so no external dependencies are required for basic functionality.

## Usage

### Starting the Application

Run the main application:
```bash
python main.py
```

### Main Menu Options

1. **Start a Study Session**
   - Select a subject to study
   - Complete a timed Pomodoro session
   - Rate your focus and track interruptions
   - Automatically logs session data

2. **View Statistics**
   - See total sessions and study time
   - View per-subject breakdown
   - Track daily progress towards goals
   - Monitor focus ratings

3. **Generate Daily Schedule**
   - Create a personalized study schedule
   - Based on your study patterns and preferences
   - Optimizes study time allocation
   - Can save schedule for reference

4. **Generate Weekly Schedule**
   - Plan your entire week of studying
   - Smart subject rotation
   - Balanced workload distribution

5. **Get AI Study Insights**
   - Receive personalized insights about your study habits
   - Identifies best study times
   - Highlights improvement areas
   - Tracks progress trends

6. **Get Next Session Suggestion**
   - AI recommends the best subject to study next
   - Based on recent sessions and performance
   - Considers time of day and study patterns
   - Quick start option for suggested session

7. **Configure Settings**
   - Customize work duration (default: 25 min)
   - Set short break length (default: 5 min)
   - Set long break length (default: 15 min)
   - Configure sessions before long break (default: 4)
   - Set daily goals

8. **Manage Subjects**
   - Add new study subjects
   - Remove subjects
   - Customize your subject list

9. **Export/Import Data**
   - Export your study data for backup
   - Import data from another device
   - Clear history if needed

## How It Works

### The Pomodoro Technique
1. Choose a subject to study
2. Work for 25 minutes (customizable)
3. Take a 5-minute break
4. After 4 sessions, take a longer 15-minute break
5. Repeat the cycle

### AI Features

The AI scheduler analyzes your study patterns including:
- **Time of day performance**: Identifies when you focus best
- **Subject preferences**: Tracks which subjects you excel at
- **Focus trends**: Monitors improvement over time
- **Study frequency**: Ensures balanced subject coverage

Based on this analysis, it:
- Creates optimized study schedules
- Suggests the best next session
- Provides actionable insights
- Adapts recommendations to your habits

## Data Storage

All data is stored locally in your home directory under `.pomodoro_data/`:
- `config.json`: Your preferences and settings
- `history.json`: Complete session history

This ensures your study data remains private and accessible offline.

## Default Configuration

- Work session: 25 minutes
- Short break: 5 minutes
- Long break: 15 minutes
- Sessions before long break: 4
- Default subjects: Math, Science, History, English
- Daily goal: 8 sessions / 4 hours

All settings can be customized through the application menu.

## Tips for Effective Study

1. **Eliminate distractions** before starting a session
2. **Be honest** with your focus ratings for better AI insights
3. **Take breaks seriously** - they improve long-term focus
4. **Review your statistics** regularly to track improvement
5. **Follow AI suggestions** - they're based on your actual performance
6. **Set realistic daily goals** that you can consistently achieve

## Example Usage Scenario

```
1. Start the app: python main.py
2. Select option 6: Get next session suggestion
3. AI suggests: "Study Math - 25 minutes - morning is your peak time"
4. Start the suggested session
5. Complete the focused work session
6. Take a 5-minute break
7. View statistics to see your progress
8. Generate daily schedule for planning tomorrow
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Created to help students study more effectively through AI-powered time management and scheduling.
