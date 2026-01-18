import { PomodoroTimer } from "@/components/pomodoro-timer";
import { Header } from "@/components/header";

export default function FocusPage() {
    return (
        <>
            <Header title="Focus Timer" subtitle="Time to concentrate and earn XP!" />
            <div className="p-6 max-w-4xl mx-auto">
                <PomodoroTimer />
            </div>
        </>
    );
}
