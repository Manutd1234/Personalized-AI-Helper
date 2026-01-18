import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Header } from "@/components/header";

export default function AnalyticsPage() {
    return (
        <>
            <Header title="Analytics" subtitle="Track your progress and optimize." />
            <div className="p-6">
                <AnalyticsDashboard />
            </div>
        </>
    );
}
