import { InterviewSetup } from "@/components/interview/interview-setup";
import { InterviewLayout } from "@/components/interview/interview-layout";

export default function SetupPage() {
  return (
    <InterviewLayout
      title="Interview Setup"
      subtitle="Let us verify your system is ready for the interview"
      backHref="/interview"
    >
      <InterviewSetup />
    </InterviewLayout>
  );
}
