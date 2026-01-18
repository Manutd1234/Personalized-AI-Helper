import { AIChat } from "@/components/ai-chat";
import { Header } from "@/components/header";

export default function AIPage() {
    return (
        <>
            <Header title="AI Coach" subtitle="Get personalized study guidance and productivity insights." />
            <div className="p-6">
                <AIChat />
            </div>
        </>
    );
}
