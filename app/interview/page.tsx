import { CandidateDetailsForm } from "@/components/interview/candidate-form";
import { InterviewLayout } from "@/components/interview/interview-layout";

export default function InterviewPage() {
  return (
    <InterviewLayout
      title="Candidate Details"
      subtitle="Please provide your information to begin the interview"
    >
      <CandidateDetailsForm />
    </InterviewLayout>
  );
}
