// Interview Platform Types

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  roleApplied: string;
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  skills: string[];
  resumeFileName?: string;
}

export interface InterviewQuestion {
  id: string;
  type: "behavioral" | "technical" | "coding" | "situational";
  question: string;
  expectedDuration: number; // in seconds
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: Record<string, string>;
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  status: "not_started" | "in_progress" | "completed" | "cancelled";
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  codingQuestion?: CodingQuestion;
  startTime?: Date;
  endTime?: Date;
  answers: InterviewAnswer[];
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  duration: number; // in seconds
  confidence?: number; // 0-100
  timestamp: Date;
}

export interface InterviewResult {
  sessionId: string;
  candidateId: string;
  overallScore: number;
  questionsAttempted: number;
  totalQuestions: number;
  totalDuration: number;
  strengths: string[];
  improvements: string[];
  categoryScores: {
    category: string;
    score: number;
    maxScore: number;
  }[];
  recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
  aiNotes: string;
}

export interface DeviceStatus {
  camera: "checking" | "ready" | "error" | "not_found";
  microphone: "checking" | "ready" | "error" | "not_found";
  internet: "checking" | "good" | "fair" | "poor";
  browser: "compatible" | "incompatible" | "unknown";
}

export type InterviewStep = 
  | "landing"
  | "candidate_details"
  | "setup"
  | "interview"
  | "coding"
  | "summary";

export interface AppState {
  currentStep: InterviewStep;
  candidate: Candidate | null;
  session: InterviewSession | null;
  deviceStatus: DeviceStatus;
  result: InterviewResult | null;
  theme: "light" | "dark";
}
